#!/usr/bin/env bash
# Model-checks the TLA+ models in verify/tla with TLC (`pnpm verify:models`).
#
# Every `<Model>.cfg` must pass: TLC explores the whole finite state space and
# finds no violation. Every `<Model>.broken-<what>.cfg` turns on a deliberately
# broken design and must fail with the violation named on its `\* expect:` line,
# which proves that check can fail. A timeout or an incomplete run is a failure.
#
# Java and TLC are pinned, checksum-verified and cached in $ERXES_VERIFY_CACHE.
# Each run's full TLC output (with any counterexample trace) is kept in $TLC_OUT.
set -euo pipefail

TLA_VERSION=1.7.4
TLA_SHA256=936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88
JRE_VERSION=21.0.13+9
TIME_LIMIT=${TLC_TIME_LIMIT:-300}

[ "$(uname -s)" = Linux ] || { echo "verify:models pins a Linux Java; run it on Linux" >&2; exit 1; }

case "$(uname -m)" in
  x86_64) JRE_ARCH=x64 JRE_SHA256=a535a1df9c6284d9618872984e026ae0352d1f7e9e0605425c0e6114f47351dd ;;
  aarch64 | arm64) JRE_ARCH=aarch64 JRE_SHA256=b1734db7ade49c3f6acc6ae06233b8c2dd90e3e2f00f67000ae1c972aaa64d8c ;;
  *) echo "no pinned Java for $(uname -m)" >&2; exit 1 ;;
esac

root=$(cd "$(dirname "$0")/.." && pwd)
cache=${ERXES_VERIFY_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/erxes-verify}
out=${TLC_OUT:-$root/.scratch/tlc}

# fetch <url> <sha256> <dest>: downloads once, refuses bytes with another checksum.
fetch() {
  if [ -f "$3" ] && echo "$2  $3" | sha256sum -c --status; then return; fi
  curl -fsSL --retry 3 -o "$3.part" "$1"
  echo "$2  $3.part" | sha256sum -c --quiet
  mv "$3.part" "$3"
}

mkdir -p "$cache" "$out"

jar=$cache/tla2tools-$TLA_VERSION.jar
fetch "https://github.com/tlaplus/tlaplus/releases/download/v$TLA_VERSION/tla2tools.jar" "$TLA_SHA256" "$jar"

jre=$cache/temurin-jre-$JRE_VERSION-$JRE_ARCH
if [ ! -x "$jre/bin/java" ]; then
  tarball=$cache/temurin-jre-$JRE_VERSION-$JRE_ARCH.tar.gz
  fetch "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-${JRE_VERSION/+/%2B}/OpenJDK21U-jre_${JRE_ARCH}_linux_hotspot_${JRE_VERSION/+/_}.tar.gz" "$JRE_SHA256" "$tarball"
  rm -rf "$jre.part"
  mkdir "$jre.part"
  tar -xzf "$tarball" -C "$jre.part" --strip-components=1
  rm "$tarball"
  mv "$jre.part" "$jre"
fi

echo "TLC $TLA_VERSION on Temurin $JRE_VERSION, time limit ${TIME_LIMIT}s per config, logs in $out"

failed=0

for cfg in "$root"/verify/tla/*.cfg; do
  name=$(basename "$cfg" .cfg)
  spec=${name%%.*}
  log=$out/$name.log
  expect=$(sed -n 's/^\\\* expect: //p' "$cfg")

  set +e
  (
    cd "$root/verify/tla"
    timeout "$TIME_LIMIT" "$jre/bin/java" -XX:+UseParallelGC -cp "$jar" tlc2.TLC \
      -workers auto -cleanup -metadir "$out/$name.states" -config "$name.cfg" "$spec.tla"
  ) > "$log" 2>&1
  code=$?
  set -e

  states=$(grep -Eo '[0-9,]+ distinct states found' "$log" | tail -1 || true)

  if [ "$code" = 124 ]; then
    echo "FAIL $name: no result within ${TIME_LIMIT}s ($log)"
    failed=1
  elif [ -z "$expect" ]; then
    if [ "$code" = 0 ] && grep -q 'Model checking completed. No error has been found.' "$log"; then
      echo "ok   $name: no violation, $states"
    else
      echo "FAIL $name: TLC exited $code; the trace is in $log"
      grep -E '^Error:|is violated' "$log" | head -5
      failed=1
    fi
  elif [ "$code" != 0 ] && grep -qF "$expect" "$log"; then
    echo "ok   $name: fails as it must ($expect)"
  else
    echo "FAIL $name: expected \"$expect\", TLC exited $code ($log)"
    failed=1
  fi
done

exit "$failed"
