# Backend Plugin Rules

## Project Shape

```bash
module_name/
├── db/        # DB
├── graphql/   # GraphQL schema, queries and mutations
├── @types/    # TypeScript interfaces and types
├── utils/     # Utility functions
├── trpc/      # Trpc
├── routes/    # express routes
```

routes:
module tus buriig salgasan route uudiig tsugluulsan file.

## Join Gateway

ymar nertei plugin, ymar nertei port deer assan medeelliig ugnu. Uuniig plugin-aas redis ruu hadgalaad redis-ees gateway bolon busad plugin huleej avna.

## Imports

'~/_' ashiglasan bol src-oos import hiisen gesen ug.
'@/_' ashiglasan bol module-aas import hiisen gesen ug.

## Apollo (graphql)

# Schema & Query Rules

schema zarlahdaa (keyfield: "\_id") zarlaj uguh heregtei.
buh list response ni list bolon totalcount tai baina.
context uguhduu expressMiddleware ashiglana.

# Express Middleware

Uusgesen apollo server iig Express app tai holboj huseltuudiig udirdana.

## Mongoose Models

definition hesegt "timestamps: true" gej ugvul "createdAt", "updatedAt" automataar uusdeg.
id-uudiig zaaval indexleh ystoi.

## Trpc

        prevMessage = await sendTRPCMessage({
          subdomain,

          pluginName: 'frontline', // plugin ner
          method: 'query', //guitsetgeh uildliin turliig zaana
          module: 'conversationMessages', // tuhain plugin ii yag
                                          //ali module ruu handahiig
                                          //zaana
          action: 'findOne', // tuhain module dotor ajillah function
                             //buyu uildliig zaana
          input: query, // hailt hiihed ashiglah filter
        });

## Pagination

neg list duudahad tuhain list iin ugugdluus gadna totalcount bolon pageInfo nariig zaaval duudna.
buh list deer cursorPaginate func ashiglana.

## Plugin Development

shine plugin uusgehed port davhtsuulj bolohgui.
.env deer asaah plugin-ii neriig zaaj ugnu.

## Warnings

ali boloh "any" type ashiglahgui.
import deer urgelj absolute path-uudiig ashiglana. "~/", "@/" geh zereg
ali boloh core deer nemelt hugjuulelt hiilgui extend ashiglah
