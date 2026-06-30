# Loyalty score логикийн тайлбар

Энэ модуль оноог `score_logs` collection дээр ledger буюу журнал хэлбэрээр
хадгална. Owner дээр байгаа `score` эсвэл `propertiesData[fieldId]` нь
одоогийн ашиглах хурдан утга, харин үнэн эх сурвалж нь `score_logs` гэж үзнэ.

## Үндсэн ойлголт

`scoreCampaign` нь ямар owner-ийн ямар талбарыг удирдахыг заана.

- `ownerType` нь `customer`, `company`, `user`, `cpUser` гэх мэт эзэмшигчийг
  заана.
- `fieldId` байвал оноо тухайн owner-ийн `propertiesData[fieldId]` дээр
  хадгалагдана.
- `fieldId` байхгүй бол owner-ийн үндсэн `score` талбарыг өөрчилнө.
- `add`, `subtract`, `set` нь campaign дээр тохируулдаг formula tab-ууд.

`scoreLog.action` нь онооны математик утгыг дангаараа тодорхойлох талбар биш.
Энэ нь аль formula tab-аар бодогдож бүртгэгдсэн бэ гэдгийг тэмдэглэнэ. Бодит
өөрчлөлт эсвэл онооны утга нь `changeScore` дээр хадгалагдана.

## changeScore

`changeScore` бол score log-ийн гол утга.

- `add` үед formula-аас гарсан дүн яг тэр чигээрээ хадгалагдана.
- `subtract` үед formula-аас гарсан дүн яг тэр чигээрээ хадгалагдана.
- `set` үед formula-аас гарсан эцсийн absolute утга хадгалагдана.
- `refund` үед add/subtract log-ийг буцаах signed reverse утга хадгалагдана.
- `return` үед set log-ийг буцаах absolute утга хадгалагдана.

`add` эсвэл `subtract` action-тай log дээр `changeScore` заавал эерэг эсвэл
заавал сөрөг байна гэж үзэхгүй. Formula ямар утга буцаасан байна, тэр утгаараа
журналд бичигдэнэ. Тиймээс `action`-оор тэмдэг сольж тайлбарлахгүй,
`changeScore`-ийн тэмдгийг шууд ашиглана.

## action төрлүүд

### add

`add` нь campaign-ийн add tab-аар бодогдсон log.

Энэ нь ихэвчлэн оноо нэмэх зориулалттай боловч formula сөрөг утга буцаавал
оноо хасагдаж болно. Ledger replay хийхдээ:

```text
score = score + changeScore
```

### subtract

`subtract` нь campaign-ийн subtract tab-аар бодогдсон log.

Ихэвчлэн цуглуулсан оноо ашиглах үед үүснэ. Formula-ийн үр дүн ямар байна,
тэр чигээрээ `changeScore` дээр бичигдэнэ. Ledger replay хийхдээ:

```text
score = score + changeScore
```

### set

`set` нь campaign-ийн set tab-аар бодогдсон log.

Энэ action delta биш. Formula 10 гэж бодогдсон бол `changeScore: 10` гэж
хадгална. Өмнөх оноо 3 байсан эсэх нь `changeScore` дээр нөлөөлөхгүй.
Ledger replay хийхдээ:

```text
score = changeScore
```

Хэрэв одоогийн owner score нь formula-аас гарсан set утгатай тэнцүү бол шинэ
log үүсгэхгүй.

### refund

`refund` нь `add` эсвэл `subtract` action-тай эх log-ийг буцаасан log.

Энэ нь delta маягаар ажиллана. Эх log-ийн `changeScore`-ийг эсрэг тэмдэгтэй
болгож хадгална. Жишээ нь:

```text
add 3000      -> refund -3000
subtract -500 -> refund 500
```

Ledger replay хийхдээ:

```text
score = score + changeScore
```

### return

`return` нь `set` action-тай эх log-ийг буцаасан log.

`set` нь absolute утга тул түүнийг буцаахдаа delta бичихгүй. Харин тухайн set
log үүсэхээс өмнөх онооны absolute утгыг өмнөх logs-оос replay хийж олно,
тэгээд `return.changeScore` дээр тэр absolute утгыг хадгална.

Жишээ:

```text
set 3
set 10
return 3
```

Ledger replay хийхдээ `return` нь `set`-тэй адил:

```text
score = changeScore
```

`preScore` байгаа эсэхээс үл хамаарч `return`-ийн буцах утгыг өмнөх logs-оос
тооцно. `preScore` нь зөвхөн мэдээллийн чанартай audit талбар.

## preScore

`preScore` нь тухайн log бичигдэхийн өмнөх owner score-ийн мэдээллийн snapshot.

Энэ талбар нь:

- audit/debug хийхэд ашиглагдана;
- score replay хийх үндсэн эх сурвалж биш;
- `set`-ийн `return` бодоход shortcut болж ашиглагдахгүй;
- байхгүй хуучин data дээр migration/recovery script-үүдээр нөхөгдөж болно.

## Ledger replay дүрэм

Owner-ийн оноог logs-оос дахин тооцохдоо logs-ийг `createdAt`, дараа нь `_id`
дарааллаар уншина.

```text
эхлэх score = 0

add/subtract/refund:
  score = score + changeScore

set/return:
  score = changeScore
```

Энэ дүрмийг owner property засах script, balance query, set return logic бүгд
ижил ашиглах ёстой.

## Stage-тэй campaign

Sales deal болон POS order дээр stage/status-аас хамаарч campaign ажиллана.

Sales deal:

- `additionalConfig.cardBasedRule.stageIds` дотор байвал won буюу оноо бодох
  stage гэж үзнэ.
- `additionalConfig.cardBasedRule.refundStageIds` дотор байвал loss буюу
  буцаалт stage гэж үзнэ.
- бусад stage нь pre stage гэж үзэгдэнэ.

POS order:

- `status === "complete"` бол won stage.
- `status === "return"` бол loss stage.
- бусад status бол pre stage.

Stage rule-тэй campaign дээр:

- pre -> won үед оноо бодогдоно;
- won -> loss үед өмнөх active log буцаагдана;
- loss -> won үед өмнөх refund/return log цэвэрлэгдээд won stage дээр шинээр
  бодогдоно;
- pre -> loss үед өмнө active won log байхгүй бол юу ч хийхгүй;
- won -> pre эсвэл loss -> pre үед өмнөх төлөвийн active/refund log хэвээр
  хадгалагдана.

## Давхар бүртгэлээс сэргийлэх

Нэг target дээр нэг campaign/action-ийн active log байвал дахин шинээр log
үүсгэхгүй, шаардлагатай бол одоо байгаа log-ийн `changeScore`-ийг шинэ
formula-ийн үр дүнгээр update хийнэ.

Active log гэдэг нь тухайн target/campaign/action log дээр холбоотой
`refund` эсвэл `return` log үүсээгүй байгаа log.

## Засвар болон recovery script-үүд

`migrateScoreLogsToSigned.ts` нь хуучин V2/master data-г V3 ledger дүрэм рүү
нэг удаа шилжүүлэх generic migration.

`recoveryScoreLog.ts` нь Prius шиг backup collection-оос score log сэргээх
нэг удаагийн recovery script.

`restoreSetLvlScores.ts` нь хуучин automation-аар үүсэх ёстой байсан level
`set` logs-ийг score logs дээр нөхөж үүсгэх тусгай script.

`correctOwnerPropertyFromScorelog.ts` нь logs-ийг replay хийж owner-ийн
`propertiesData[fieldId]` эсвэл `score` утгыг засах script. Энэ нь log-той
owner-уудыг replay хийнэ, мөн тухайн field дээр property утгатай боловч log
огт байхгүй owner-уудыг 0 болгож цэвэрлэнэ.
