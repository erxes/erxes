# Loyalty doc-ийн зураг, бичлэгийн жагсаалт

[README.md](README.md)-д ашиглагдах 14 зураг ба бичлэг. Бүгд `docs/loyalty/media/` хавтсанд, доорх нэрээр хадгална.

## Ерөнхий дүрэм

- **Өгөгдөл:** бодит мэт харагдах жишээ өгөгдөл ашиглана: "Оноо" хэтэвч (Silver / Gold / Platinum), "Кофе шоп" POS, хэдэн customer. Жинхэнэ customer-ийн нэр, утас **бүү** харуул.
- **Хэмжээ:** browser-ийн цонх ~1440×900, хэрэгтэй хэсгийг л тайрна. Бүтэн дэлгэц бүү ав.
- **Зураг (`.png`):** `Cmd+Shift+4`, дараа нь хэсгээ сонгоно.
- **Бичлэг (`.gif`):** `Cmd+Shift+5` → "Record Selected Portion". **5–15 секунд**, нэг үйлдэл. Хулганаа удаан, тайван хөдөлгө.
  - GitHub repo доторх markdown `.mov`/`.mp4`-ийг тоглуулдаггүй, тиймээс **GIF болгоно**: [Gifski](https://gif.ski) (App Store, үнэгүй), эсвэл `brew install ffmpeg` суулгаад:
    ```bash
    ffmpeg -i input.mov -vf "fps=12,scale=960:-1:flags=lanczos" -loop 0 output.gif
    ```
  - GIF-ийг 5MB-аас бага байлгана.
- **Хэл:** UI-г **Монгол** хэл дээр авна.

## Жагсаалт

| # | Файл | Төрөл | Хаана | Юуг харуулах | Бэлтгэл |
| --- | --- | --- | --- | --- | --- |
| 1 | `01-wallet-form.png` | Зураг | Settings → Loyalty → Wallets → хэтэвч засах | Ерөнхий + Оноо хэсэг: нэр, эзэмшигч, ханш, онооны үнэ, tier-ийн жагсаалт | Silver/Gold/Platinum-тэй "Оноо" хэтэвч |
| 2 | `02-wallet-period-preview.png` | Зураг | Мөн form → "Хугацаа ба reset" | Pending, expiry, reset тохиргоо + доод талын урьдчилсан харагдац | Pending 14 хоног, жилийн reset |
| 3 | `03-accounts-list.png` | Зураг | Loyalty → Дансууд | Жагсаалт: хэтэвчийн баганууд, tier, төлөв; нэг мөрийн цэс нээлттэй | 4–5 данс, нэг нь хөлдсөн |
| 4 | `04-account-card.png` | Зураг | Customer profile → loyalty widget | Дансны карт: дугаар, үлдэгдэл, tier, хүлээгдэж буй, удахгүй дуусах | Pending оноотой customer |
| 5 | `05-earn-table.png` | Зураг | Settings → Loyalty → Score → campaign → Add tab | Earn table: нэг үндсэн мөр + нэг bonus мөр, tier-ийн баганууд, жишээ тооцоо | "1000₮ = 1 оноо", Gold ×2 |
| 6 | `06-sales-earn-config.gif` | Бичлэг | Sales → Boards & Pipelines → "Оноо олгох тохиргоо" | Dialog нээх → Оноо tab дээр pipeline сонгох → campaign, stage сонгох → Tier tab руу шилжих → хадгалах | Board, pipeline, campaign бэлэн |
| 7 | `07-automation-adjust-score.png` | Зураг | Automations → builder | POS order trigger → Adjust score action, action-ий тохиргоо нээлттэй (campaign + мөрүүдийн checkbox) | Нэг automation |
| 8 | `08-tier-bands.png` | Зураг | "Оноо олгох тохиргоо" → Tier tab, эсвэл POS → Payment → "Tier тогтоох" | Хэтэвч сонгосон, Silver/Gold/Platinum-ийн муж, "зөвхөн ахиулах" чагттай | — |
| 9 | `09-tier-history.png` | Зураг | Дансууд → мөрийн цэс → Tier history | 3–4 мөр: худалдан авалтаар ("POS #…"), automation-аар, гараар | Tier-ийг хэд хэдэн замаар солих |
| 10 | `10-birthday-voucher.gif` | Бичлэг | Voucher campaign засах → "Төрсөн өдөр" tab | "Төрсөн өдрөөр олгох" дарах → үүссэн segment, broadcast, automation харагдах | Voucher campaign бэлэн |
| 11 | `11-pos-loyalty-panel.gif` | Бичлэг | POS касс | Customer сонгох → панел гарах (үлдэгдэл, tier, "+N оноо") → бараа нэмэхэд "+N" өөрчлөгдөх → voucher "Хэрэглэх" | Үлдэгдэл, voucher-тэй customer, POS дээр earn campaign |
| 12 | `12-pos-customer-register.gif` | Бичлэг | POS касс → customer хайлт | Утас бичих → олдохгүй → "Хэрэглэгч нэмэх" → form бөглөх → хадгалахад шууд сонгогдох | POS → Customer registration асаалттай |
| 13 | `13-deal-loyalty.png` | Зураг | Sales → deal дэлгэрэнгүй | Loyalty widget: энэ deal-ээр хөдөлсөн оноо ба tier өөрчлөлт; хажууд board card-ын онооны badge | Оноо олгох stage-д орсон deal |
| 14 | `14-scores-breakdown.gif` | Бичлэг | Loyalty → Оноонууд | Owner-оор шүүх → нэг мөрийн Breakdown нүдэн дээр дарах → тооцооны алхам гарах | Хэдэн score log |

## Шалгах

Бүгдийг хийсний дараа README-ийн зургийн холбоос бүр файлтай эсэхийг шалгана:

```bash
grep -o 'media/[^)]*' docs/loyalty/README.md | sort -u | while read f; do [ -f "docs/loyalty/$f" ] || echo "Дутуу: $f"; done
```
