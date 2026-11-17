[1mdiff --git a/api/package.json b/api/package.json[m
[1mindex 90384d1..5b2760e 100644[m
[1m--- a/api/package.json[m
[1m+++ b/api/package.json[m
[36m@@ -12,6 +12,8 @@[m
   },[m
   "dependencies": {[m
     "@fastify/cors": "^11.3.1",[m
[32m+[m[32m    "@fastify/jwt": "^10.2.8",[m
[32m+[m[32m    "bcryptjs": "^3.0.3",[m
     "fastify": "^5.12.0",[m
     "fastify-type-provider-zod": "^7.0.0",[m
     "zod": "^4.6.7"[m
[1mdiff --git a/api/src/app.ts b/api/src/app.ts[m
[1mindex cef82f2..86f7818 100644[m
[1m--- a/api/src/app.ts[m
[1m+++ b/api/src/app.ts[m
[36m@@ -1,4 +1,5 @@[m
 import cors from "@fastify/cors";[m
[32m+[m[32mimport jwt from "@fastify/jwt";[m
 import Fastify, { type FastifyInstance } from "fastify";[m
 import {[m
   hasZodFastifySchemaValidationErrors,[m
[36m@@ -43,6 +44,11 @@[m [mexport function buildApp([m
     methods: ["GET", "POST", "PUT", "DELETE"],[m
   });[m
 [m
[32m+[m[32m  // À faire : brancher le plugin JWT, avec la clé secrète dans process.env.JWT_SECRET.[m
[32m+[m[32m  app.register(jwt, {[m
[32m+[m[32m    secret: process.env.JWT_SECRET ?? "À définir dans .env.local",[m
[32m+[m[32m  });[m
[32m+[m
   // Fourni : une route qui n'existe pas répond 404 RouteNotFound ; le front affiche « Route non implémentée ».[m
   app.setNotFoundHandler((request, reply) => {[m
     const body: ErrorBody = {[m
[1mdiff --git a/api/src/container.ts b/api/src/container.ts[m
[1mindex c143da9..526d3cd 100644[m
[1m--- a/api/src/container.ts[m
[1m+++ b/api/src/container.ts[m
[36m@@ -8,12 +8,15 @@[m [mimport { InMemoryPageRepository } from "./repositories/in-memory-page.repository[m
 import { JsonFile } from "./repositories/json-file";[m
 import { JsonFileBookRepository } from "./repositories/json-file-book.repository";[m
 import { JsonFilePageRepository } from "./repositories/json-file-page.repository";[m
[32m+[m[32mimport { JsonFileUserRepository } from "./repositories/json-file-user.repository";[m
 import type { PageRepository } from "./repositories/page.repository";[m
[32m+[m[32mimport type { UserRepository } from "./repositories/user.repository";[m
 import { BookRouter } from "./routers/book.router";[m
 import { PageRouter } from "./routers/page.router";[m
 import type { Router } from "./routers/router";[m
 import { bookRecordSchema } from "./schemas/book.schema";[m
 import { pageRecordSchema } from "./schemas/page.schema";[m
[32m+[m[32mimport { userRecordSchema, type UserRecord } from "./schemas/user.schema";[m
 import { BookService } from "./services/book.service";[m
 import { PageService } from "./services/page.service";[m
 import { SystemClock } from "./services/system-clock";[m
[36m@@ -60,6 +63,7 @@[m [mexport class Container {[m
     // 1 les 2 repositories[m
     let bookRepository: BookRepository;[m
     let pageRepository: PageRepository;[m
[32m+[m[32m    let userRepository: UserRepository;[m
 [m
     switch (config.storage) {[m
       case "memory":[m
[36m@@ -77,10 +81,14 @@[m [mexport class Container {[m
           `${config.dataDir}/pages.json`,[m
           pageRecordSchema,[m
         );[m
[32m+[m[32m        const userFile = new JsonFile<UserRecord>([m
[32m+[m[32m          `${config.dataDir}/users.json`,[m
[32m+[m[32m          userRecordSchema,[m
[32m+[m[32m        );[m
 [m
         bookRepository = new JsonFileBookRepository(bookFile);[m
         pageRepository = new JsonFilePageRepository(pageFile);[m
[31m-[m
[32m+[m[32m        userRepository = new JsonFileUserRepository(userFile);[m
         break;[m
     }[m
 [m
[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex 4aa74d0..4149b79 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -22,6 +22,8 @@[m
       "version": "1.0.0",[m
       "dependencies": {[m
         "@fastify/cors": "^11.3.1",[m
[32m+[m[32m        "@fastify/jwt": "^10.2.8",[m
[32m+[m[32m        "bcryptjs": "^3.0.3",[m
         "fastify": "^5.12.0",[m
         "fastify-type-provider-zod": "^7.0.0",[m
         "zod": "^4.6.7"[m
[36m@@ -655,6 +657,29 @@[m
       ],[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/@fastify/jwt": {[m
[32m+[m[32m      "version": "10.2.8",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@fastify/jwt/-/jwt-10.2.8.tgz",[m
[32m+[m[32m      "integrity": "sha512-JHw6aGBRr39FnHNykYeUWbvhRY7EKietGtYf+aHPRzOQuqlhub4Us4r/kze5lCB234wy+/vArlpM01SPcrPvEw==",[m
[32m+[m[32m      "funding": [[m
[32m+[m[32m        {[m
[32m+[m[32m          "type": "github",[m
[32m+[m[32m          "url": "https://github.com/sponsors/fastify"[m
[32m+[m[32m        },[m
[32m+[m[32m        {[m
[32m+[m[32m          "type": "opencollective",[m
[32m+[m[32m          "url": "https://opencollective.com/fastify"[m
[32m+[m[32m        }[m
[32m+[m[32m      ],[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@fastify/error": "^4.2.0",[m
[32m+[m[32m        "@lukeed/ms": "^2.0.2",[m
[32m+[m[32m        "fast-jwt": "^6.3.4",[m
[32m+[m[32m        "fastify-plugin": "^6.0.0",[m
[32m+[m[32m        "steed": "^1.1.3"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/@fastify/merge-json-schemas": {[m
       "version": "0.2.2",[m
       "resolved": "https://registry.npmjs.org/@fastify/merge-json-schemas/-/merge-json-schemas-0.2.2.tgz",[m
[36m@@ -763,6 +788,15 @@[m
         "@jridgewell/sourcemap-codec": "^1.4.14"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/@lukeed/ms": {[m
[32m+[m[32m      "version": "2.0.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@lukeed/ms/-/ms-2.0.2.tgz",[m
[32m+[m[32m      "integrity": "sha512-9I2Zn6+NJLfaGoz9jN3lpwDgAYvfGeNYdbAIjJOqzs4Tpc+VU3Jqq4IofSUBKajiDS8k9fZIg18/z13mpk1bsA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=8"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/@oxc-project/types": {[m
       "version": "0.154.0",[m
       "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.154.0.tgz",[m
[36m@@ -1744,6 +1778,18 @@[m
       "resolved": "api",[m
       "link": true[m
     },[m
[32m+[m[32m    "node_modules/asn1.js": {[m
[32m+[m[32m      "version": "5.4.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/asn1.js/-/asn1.js-5.4.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-+I//4cYPccV8LdmBLiX8CYvf9Sp3vQsrqu2QNXRcrbiWvcx/UdlFiqUJJzxRQxgsZmvhXhn4cSKeSmoFjVdupA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "bn.js": "^4.0.0",[m
[32m+[m[32m        "inherits": "^2.0.1",[m
[32m+[m[32m        "minimalistic-assert": "^1.0.0",[m
[32m+[m[32m        "safer-buffer": "^2.1.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/assertion-error": {[m
       "version": "2.0.1",[m
       "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",[m
[36m@@ -1879,6 +1925,15 @@[m
         "fastq": "^1.17.1"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/bcryptjs": {[m
[32m+[m[32m      "version": "3.0.3",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/bcryptjs/-/bcryptjs-3.0.3.tgz",[m
[32m+[m[32m      "integrity": "sha512-GlF5wPWnSa/X5LKM1o0wz0suXIINz1iHRLvTS+sLyi7XPbe5ycmYI3DlZqVGZZtDgl4DmasFg7gOB3JYbphV5g==",[m
[32m+[m[32m      "license": "BSD-3-Clause",[m
[32m+[m[32m      "bin": {[m
[32m+[m[32m        "bcrypt": "bin/bcrypt"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/birpc": {[m
       "version": "2.9.0",[m
       "resolved": "https://registry.npmjs.org/birpc/-/birpc-2.9.0.tgz",[m
[36m@@ -1888,6 +1943,12 @@[m
         "url": "https://github.com/sponsors/antfu"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/bn.js": {[m
[32m+[m[32m      "version": "4.12.5",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/bn.js/-/bn.js-4.12.5.tgz",[m
[32m+[m[32m      "integrity": "sha512-3aRg6/JxfffFD+OlOjOFR3Vo79l39ooBTFucxx+MT3dhCtzn3EmiUPQo+6/OZuI2jbXi3YKgmiTFBgChQMwIRQ==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
     "node_modules/chai": {[m
       "version": "6.3.0",[m
       "resolved": "https://registry.npmjs.org/chai/-/chai-6.3.0.tgz",[m
[36m@@ -2028,6 +2089,15 @@[m
         "node": ">=8"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/ecdsa-sig-formatter": {[m
[32m+[m[32m      "version": "1.0.11",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",[m
[32m+[m[32m      "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",[m
[32m+[m[32m      "license": "Apache-2.0",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "safe-buffer": "^5.0.1"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/emoji-regex": {[m
       "version": "10.6.0",[m
       "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-10.6.0.tgz",[m
[36m@@ -2181,6 +2251,22 @@[m
         "rfdc": "^1.2.0"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/fast-jwt": {[m
[32m+[m[32m      "version": "6.3.7",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/fast-jwt/-/fast-jwt-6.3.7.tgz",[m
[32m+[m[32m      "integrity": "sha512-Z1yunvhXRD74kttxDTg5NAVq4XexFRVlv78/GzUlkEwt0BRwUCVju2uWJ8TAcy95VA7lXyX93R+AKgZCVPitnQ==",[m
[32m+[m[32m      "license": "Apache-2.0",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@lukeed/ms": "^2.0.2",[m
[32m+[m[32m        "asn1.js": "^5.4.1",[m
[32m+[m[32m        "ecdsa-sig-formatter": "^1.0.11",[m
[32m+[m[32m        "mnemonist": "^0.40.0",[m
[32m+[m[32m        "safe-regex2": "^5.1.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=20"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/fast-querystring": {[m
       "version": "1.1.2",[m
       "resolved": "https://registry.npmjs.org/fast-querystring/-/fast-querystring-1.1.2.tgz",[m
[36m@@ -2206,6 +2292,18 @@[m
       ],[m
       "license": "BSD-3-Clause"[m
     },[m
[32m+[m[32m    "node_modules/fastfall": {[m
[32m+[m[32m      "version": "1.5.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/fastfall/-/fastfall-1.5.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-KH6p+Z8AKPXnmA7+Iz2Lh8ARCMr+8WNPVludm1LGkZoD2MjY6LVnRMtTKhkdzI+jr0RzQWXKzKyBJm1zoHEL4Q==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "reusify": "^1.0.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=0.10.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/fastify": {[m
       "version": "5.12.7",[m
       "resolved": "https://registry.npmjs.org/fastify/-/fastify-5.12.7.tgz",[m
[36m@@ -2270,6 +2368,16 @@[m
         "zod": ">=4.1.5"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/fastparallel": {[m
[32m+[m[32m      "version": "2.4.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/fastparallel/-/fastparallel-2.4.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-qUmhxPgNHmvRjZKBFUNI0oZuuH9OlSIOXmJ98lhKPxMZZ7zS/Fi0wRHOihDSz0R1YiIOjxzOY4bq65YTcdBi2Q==",[m
[32m+[m[32m      "license": "ISC",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "reusify": "^1.0.4",[m
[32m+[m[32m        "xtend": "^4.0.2"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/fastq": {[m
       "version": "1.20.3",[m
       "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz",[m
[36m@@ -2279,6 +2387,16 @@[m
         "reusify": "^1.0.4"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/fastseries": {[m
[32m+[m[32m      "version": "1.7.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/fastseries/-/fastseries-1.7.2.tgz",[m
[32m+[m[32m      "integrity": "sha512-dTPFrPGS8SNSzAt7u/CbMKCJ3s01N04s4JFbORHcmyvVfVKmbhMD1VtRbh5enGHxkaQDqWyLefiKOGGmohGDDQ==",[m
[32m+[m[32m      "license": "ISC",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "reusify": "^1.0.0",[m
[32m+[m[32m        "xtend": "^4.0.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/fdir": {[m
       "version": "6.5.0",[m
       "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",[m
[36m@@ -2361,6 +2479,12 @@[m
       "integrity": "sha512-Yc+BQe8SvoXH1643Qez1zqLRmbA5rCL+sSmk6TVos0LWVfNIB7PGncdlId77WzLGSIB5KaWgTaNTs2lNVEI6VQ==",[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/inherits": {[m
[32m+[m[32m      "version": "2.0.4",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",[m
[32m+[m[32m      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",[m
[32m+[m[32m      "license": "ISC"[m
[32m+[m[32m    },[m
     "node_modules/ipaddr.js": {[m
       "version": "2.5.0",[m
       "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-2.5.0.tgz",[m
[36m@@ -2764,6 +2888,12 @@[m
         "url": "https://github.com/sponsors/sxzz"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/minimalistic-assert": {[m
[32m+[m[32m      "version": "1.0.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/minimalistic-assert/-/minimalistic-assert-1.0.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-UtJcAD4yEaGtjPezWuO9wC4nwUnVH/8/Im3yEHQP4b67cXlD/Qr9hdITCU1xDbSEXg2XKNaP8jsReV7vQd00/A==",[m
[32m+[m[32m      "license": "ISC"[m
[32m+[m[32m    },[m
     "node_modules/mlly": {[m
       "version": "1.8.2",[m
       "resolved": "https://registry.npmjs.org/mlly/-/mlly-1.8.2.tgz",[m
[36m@@ -2793,6 +2923,15 @@[m
         "pathe": "^2.0.1"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/mnemonist": {[m
[32m+[m[32m      "version": "0.40.8",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/mnemonist/-/mnemonist-0.40.8.tgz",[m
[32m+[m[32m      "integrity": "sha512-tebbu8e/W45Nz7USfGcmnHUiOcNsXa9Mow8eb0UPwOk3gu6grw0/2+SefXBJCgDQpE9mdn7dNUMJBra9mcRUVw==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "obliterator": "^2.0.4"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/ms": {[m
       "version": "2.1.3",[m
       "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",[m
[36m@@ -2830,6 +2969,12 @@[m
       "integrity": "sha512-wzRsrJwNlFbqIRQt8aCeL2WE8USip/uuvGSOZV1D02CxX8ABTMbw8IywKjH7yWHETMXbWJI4OBpihg9rmz2Vyg==",[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/obliterator": {[m
[32m+[m[32m      "version": "2.0.5",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/obliterator/-/obliterator-2.0.5.tgz",[m
[32m+[m[32m      "integrity": "sha512-42CPE9AhahZRsMNslczq0ctAEtqk8Eka26QofnqC346BZdHDySk3LWka23LI7ULIw11NmltpiLagIq8gBozxTw==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
     "node_modules/obug": {[m
       "version": "3.0.0",[m
       "resolved": "https://registry.npmjs.org/obug/-/obug-3.0.0.tgz",[m
[36m@@ -3108,6 +3253,26 @@[m
         "tslib": "^2.1.0"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/safe-buffer": {[m
[32m+[m[32m      "version": "5.2.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",[m
[32m+[m[32m      "funding": [[m
[32m+[m[32m        {[m
[32m+[m[32m          "type": "github",[m
[32m+[m[32m          "url": "https://github.com/sponsors/feross"[m
[32m+[m[32m        },[m
[32m+[m[32m        {[m
[32m+[m[32m          "type": "patreon",[m
[32m+[m[32m          "url": "https://www.patreon.com/feross"[m
[32m+[m[32m   