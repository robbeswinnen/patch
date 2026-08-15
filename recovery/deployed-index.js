var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/discord-interactions/dist/util.js
var require_util = __commonJS({
  "node_modules/discord-interactions/dist/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.concatUint8Arrays = exports.valueToUint8Array = exports.subtleCrypto = void 0;
    function getSubtleCrypto() {
      if (typeof window !== "undefined" && window.crypto) {
        return window.crypto.subtle;
      }
      if (typeof globalThis !== "undefined" && globalThis.crypto) {
        return globalThis.crypto.subtle;
      }
      if (typeof crypto !== "undefined") {
        return crypto.subtle;
      }
      if (typeof __require === "function") {
        const cryptoPackage = "node:crypto";
        const crypto2 = __require(cryptoPackage);
        return crypto2.webcrypto.subtle;
      }
      throw new Error("No Web Crypto API implementation found");
    }
    __name(getSubtleCrypto, "getSubtleCrypto");
    exports.subtleCrypto = getSubtleCrypto();
    function valueToUint8Array(value, format) {
      if (value == null) {
        return new Uint8Array();
      }
      if (typeof value === "string") {
        if (format === "hex") {
          const matches2 = value.match(/.{1,2}/g);
          if (matches2 == null) {
            throw new Error("Value is not a valid hex string");
          }
          const hexVal = matches2.map((byte) => Number.parseInt(byte, 16));
          return new Uint8Array(hexVal);
        }
        return new TextEncoder().encode(value);
      }
      try {
        if (Buffer.isBuffer(value)) {
          return new Uint8Array(value);
        }
      } catch (_ex) {
      }
      if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
      }
      if (value instanceof Uint8Array) {
        return value;
      }
      throw new Error("Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array");
    }
    __name(valueToUint8Array, "valueToUint8Array");
    exports.valueToUint8Array = valueToUint8Array;
    function concatUint8Arrays(arr1, arr2) {
      const merged = new Uint8Array(arr1.length + arr2.length);
      merged.set(arr1);
      merged.set(arr2, arr1.length);
      return merged;
    }
    __name(concatUint8Arrays, "concatUint8Arrays");
    exports.concatUint8Arrays = concatUint8Arrays;
  }
});

// node_modules/discord-interactions/dist/webhooks.js
var require_webhooks = __commonJS({
  "node_modules/discord-interactions/dist/webhooks.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebhookEventType = exports.WebhookType = void 0;
    var WebhookType;
    (function(WebhookType2) {
      WebhookType2[WebhookType2["PING"] = 0] = "PING";
      WebhookType2[WebhookType2["EVENT"] = 1] = "EVENT";
    })(WebhookType || (exports.WebhookType = WebhookType = {}));
    var WebhookEventType;
    (function(WebhookEventType2) {
      WebhookEventType2["APPLICATION_AUTHORIZED"] = "APPLICATION_AUTHORIZED";
      WebhookEventType2["APPLICATION_DEAUTHORIZED"] = "APPLICATION_DEAUTHORIZED";
      WebhookEventType2["ENTITLEMENT_CREATE"] = "ENTITLEMENT_CREATE";
      WebhookEventType2["QUEST_USER_ENROLLMENT"] = "QUEST_USER_ENROLLMENT";
      WebhookEventType2["LOBBY_MESSAGE_CREATE"] = "LOBBY_MESSAGE_CREATE";
      WebhookEventType2["LOBBY_MESSAGE_UPDATE"] = "LOBBY_MESSAGE_UPDATE";
      WebhookEventType2["LOBBY_MESSAGE_DELETE"] = "LOBBY_MESSAGE_DELETE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_CREATE"] = "GAME_DIRECT_MESSAGE_CREATE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_UPDATE"] = "GAME_DIRECT_MESSAGE_UPDATE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_DELETE"] = "GAME_DIRECT_MESSAGE_DELETE";
    })(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
  }
});

// node_modules/discord-interactions/dist/components.js
var require_components = __commonJS({
  "node_modules/discord-interactions/dist/components.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SeparatorSpacingTypes = exports.TextStyleTypes = exports.ChannelTypes = exports.ButtonStyleTypes = exports.MessageComponentTypes = void 0;
    var MessageComponentTypes;
    (function(MessageComponentTypes2) {
      MessageComponentTypes2[MessageComponentTypes2["ACTION_ROW"] = 1] = "ACTION_ROW";
      MessageComponentTypes2[MessageComponentTypes2["BUTTON"] = 2] = "BUTTON";
      MessageComponentTypes2[MessageComponentTypes2["STRING_SELECT"] = 3] = "STRING_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["INPUT_TEXT"] = 4] = "INPUT_TEXT";
      MessageComponentTypes2[MessageComponentTypes2["USER_SELECT"] = 5] = "USER_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["ROLE_SELECT"] = 6] = "ROLE_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["MENTIONABLE_SELECT"] = 7] = "MENTIONABLE_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["CHANNEL_SELECT"] = 8] = "CHANNEL_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["SECTION"] = 9] = "SECTION";
      MessageComponentTypes2[MessageComponentTypes2["TEXT_DISPLAY"] = 10] = "TEXT_DISPLAY";
      MessageComponentTypes2[MessageComponentTypes2["THUMBNAIL"] = 11] = "THUMBNAIL";
      MessageComponentTypes2[MessageComponentTypes2["MEDIA_GALLERY"] = 12] = "MEDIA_GALLERY";
      MessageComponentTypes2[MessageComponentTypes2["FILE"] = 13] = "FILE";
      MessageComponentTypes2[MessageComponentTypes2["SEPARATOR"] = 14] = "SEPARATOR";
      MessageComponentTypes2[MessageComponentTypes2["CONTAINER"] = 17] = "CONTAINER";
      MessageComponentTypes2[MessageComponentTypes2["LABEL"] = 18] = "LABEL";
    })(MessageComponentTypes || (exports.MessageComponentTypes = MessageComponentTypes = {}));
    var ButtonStyleTypes;
    (function(ButtonStyleTypes2) {
      ButtonStyleTypes2[ButtonStyleTypes2["PRIMARY"] = 1] = "PRIMARY";
      ButtonStyleTypes2[ButtonStyleTypes2["SECONDARY"] = 2] = "SECONDARY";
      ButtonStyleTypes2[ButtonStyleTypes2["SUCCESS"] = 3] = "SUCCESS";
      ButtonStyleTypes2[ButtonStyleTypes2["DANGER"] = 4] = "DANGER";
      ButtonStyleTypes2[ButtonStyleTypes2["LINK"] = 5] = "LINK";
      ButtonStyleTypes2[ButtonStyleTypes2["PREMIUM"] = 6] = "PREMIUM";
    })(ButtonStyleTypes || (exports.ButtonStyleTypes = ButtonStyleTypes = {}));
    var ChannelTypes;
    (function(ChannelTypes2) {
      ChannelTypes2[ChannelTypes2["GUILD_TEXT"] = 0] = "GUILD_TEXT";
      ChannelTypes2[ChannelTypes2["DM"] = 1] = "DM";
      ChannelTypes2[ChannelTypes2["GUILD_VOICE"] = 2] = "GUILD_VOICE";
      ChannelTypes2[ChannelTypes2["GROUP_DM"] = 3] = "GROUP_DM";
      ChannelTypes2[ChannelTypes2["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
      ChannelTypes2[ChannelTypes2["GUILD_ANNOUNCEMENT"] = 5] = "GUILD_ANNOUNCEMENT";
      ChannelTypes2[ChannelTypes2["GUILD_STORE"] = 6] = "GUILD_STORE";
      ChannelTypes2[ChannelTypes2["ANNOUNCEMENT_THREAD"] = 10] = "ANNOUNCEMENT_THREAD";
      ChannelTypes2[ChannelTypes2["PUBLIC_THREAD"] = 11] = "PUBLIC_THREAD";
      ChannelTypes2[ChannelTypes2["PRIVATE_THREAD"] = 12] = "PRIVATE_THREAD";
      ChannelTypes2[ChannelTypes2["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
      ChannelTypes2[ChannelTypes2["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
      ChannelTypes2[ChannelTypes2["GUILD_FORUM"] = 15] = "GUILD_FORUM";
      ChannelTypes2[ChannelTypes2["GUILD_MEDIA"] = 16] = "GUILD_MEDIA";
    })(ChannelTypes || (exports.ChannelTypes = ChannelTypes = {}));
    var TextStyleTypes;
    (function(TextStyleTypes2) {
      TextStyleTypes2[TextStyleTypes2["SHORT"] = 1] = "SHORT";
      TextStyleTypes2[TextStyleTypes2["PARAGRAPH"] = 2] = "PARAGRAPH";
    })(TextStyleTypes || (exports.TextStyleTypes = TextStyleTypes = {}));
    var SeparatorSpacingTypes;
    (function(SeparatorSpacingTypes2) {
      SeparatorSpacingTypes2[SeparatorSpacingTypes2["SMALL"] = 1] = "SMALL";
      SeparatorSpacingTypes2[SeparatorSpacingTypes2["LARGE"] = 2] = "LARGE";
    })(SeparatorSpacingTypes || (exports.SeparatorSpacingTypes = SeparatorSpacingTypes = {}));
  }
});

// node_modules/discord-interactions/dist/index.js
var require_dist = __commonJS({
  "node_modules/discord-interactions/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyWebhookEventMiddleware = exports.verifyKeyMiddleware = exports.verifyKey = exports.InteractionResponseFlags = exports.InteractionResponseType = exports.InteractionType = void 0;
    var util_1 = require_util();
    var webhooks_1 = require_webhooks();
    var InteractionType;
    (function(InteractionType2) {
      InteractionType2[InteractionType2["PING"] = 1] = "PING";
      InteractionType2[InteractionType2["APPLICATION_COMMAND"] = 2] = "APPLICATION_COMMAND";
      InteractionType2[InteractionType2["MESSAGE_COMPONENT"] = 3] = "MESSAGE_COMPONENT";
      InteractionType2[InteractionType2["APPLICATION_COMMAND_AUTOCOMPLETE"] = 4] = "APPLICATION_COMMAND_AUTOCOMPLETE";
      InteractionType2[InteractionType2["MODAL_SUBMIT"] = 5] = "MODAL_SUBMIT";
    })(InteractionType || (exports.InteractionType = InteractionType = {}));
    var InteractionResponseType;
    (function(InteractionResponseType2) {
      InteractionResponseType2[InteractionResponseType2["PONG"] = 1] = "PONG";
      InteractionResponseType2[InteractionResponseType2["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
      InteractionResponseType2[InteractionResponseType2["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
      InteractionResponseType2[InteractionResponseType2["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
      InteractionResponseType2[InteractionResponseType2["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
      InteractionResponseType2[InteractionResponseType2["APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
      InteractionResponseType2[InteractionResponseType2["MODAL"] = 9] = "MODAL";
      InteractionResponseType2[InteractionResponseType2["PREMIUM_REQUIRED"] = 10] = "PREMIUM_REQUIRED";
      InteractionResponseType2[InteractionResponseType2["LAUNCH_ACTIVITY"] = 12] = "LAUNCH_ACTIVITY";
    })(InteractionResponseType || (exports.InteractionResponseType = InteractionResponseType = {}));
    var InteractionResponseFlags;
    (function(InteractionResponseFlags2) {
      InteractionResponseFlags2[InteractionResponseFlags2["EPHEMERAL"] = 64] = "EPHEMERAL";
      InteractionResponseFlags2[InteractionResponseFlags2["IS_COMPONENTS_V2"] = 32768] = "IS_COMPONENTS_V2";
    })(InteractionResponseFlags || (exports.InteractionResponseFlags = InteractionResponseFlags = {}));
    function verifyKey2(rawBody, signature, timestamp2, clientPublicKey) {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const timestampData = (0, util_1.valueToUint8Array)(timestamp2);
          const bodyData = (0, util_1.valueToUint8Array)(rawBody);
          const message = (0, util_1.concatUint8Arrays)(timestampData, bodyData);
          const publicKey = typeof clientPublicKey === "string" ? yield util_1.subtleCrypto.importKey("raw", (0, util_1.valueToUint8Array)(clientPublicKey, "hex"), {
            name: "ed25519",
            namedCurve: "ed25519"
          }, false, ["verify"]) : clientPublicKey;
          const isValid = yield util_1.subtleCrypto.verify({
            name: "ed25519"
          }, publicKey, (0, util_1.valueToUint8Array)(signature, "hex"), message);
          return isValid;
        } catch (_ex) {
          return false;
        }
      });
    }
    __name(verifyKey2, "verifyKey");
    exports.verifyKey = verifyKey2;
    function verifyKeyMiddleware(clientPublicKey) {
      if (!clientPublicKey) {
        throw new Error("You must specify a Discord client public key");
      }
      return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const timestamp2 = req.header("X-Signature-Timestamp") || "";
        const signature = req.header("X-Signature-Ed25519") || "";
        if (!timestamp2 || !signature) {
          res.statusCode = 401;
          res.end("[discord-interactions] Invalid signature");
          return;
        }
        function onBodyComplete(rawBody) {
          return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield verifyKey2(rawBody, signature, timestamp2, clientPublicKey);
            if (!isValid) {
              res.statusCode = 401;
              res.end("[discord-interactions] Invalid signature");
              return;
            }
            const body = JSON.parse(rawBody.toString("utf-8")) || {};
            if (body.type === InteractionType.PING) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                type: InteractionResponseType.PONG
              }));
              return;
            }
            req.body = body;
            next();
          });
        }
        __name(onBodyComplete, "onBodyComplete");
        if (req.body) {
          if (Buffer.isBuffer(req.body)) {
            yield onBodyComplete(req.body);
          } else if (typeof req.body === "string") {
            yield onBodyComplete(Buffer.from(req.body, "utf-8"));
          } else {
            console.warn("[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.");
            yield onBodyComplete(Buffer.from(JSON.stringify(req.body), "utf-8"));
          }
        } else {
          const chunks = [];
          req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          req.on("end", () => __awaiter(this, void 0, void 0, function* () {
            const rawBody = Buffer.concat(chunks);
            yield onBodyComplete(rawBody);
          }));
        }
      });
    }
    __name(verifyKeyMiddleware, "verifyKeyMiddleware");
    exports.verifyKeyMiddleware = verifyKeyMiddleware;
    function verifyWebhookEventMiddleware(clientPublicKey) {
      if (!clientPublicKey) {
        throw new Error("You must specify a Discord client public key");
      }
      return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const timestamp2 = req.header("X-Signature-Timestamp") || "";
        const signature = req.header("X-Signature-Ed25519") || "";
        if (!timestamp2 || !signature) {
          res.statusCode = 401;
          res.end("[discord-interactions] Invalid signature");
          return;
        }
        function onBodyComplete(rawBody) {
          return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield verifyKey2(rawBody, signature, timestamp2, clientPublicKey);
            if (!isValid) {
              res.statusCode = 401;
              res.end("[discord-interactions] Invalid signature");
              return;
            }
            const body = JSON.parse(rawBody.toString("utf-8")) || {};
            if (body.type === webhooks_1.WebhookType.PING) {
              res.statusCode = 204;
              res.end();
              return;
            }
            req.body = body;
            res.statusCode = 204;
            res.end();
            next();
          });
        }
        __name(onBodyComplete, "onBodyComplete");
        if (req.body) {
          if (Buffer.isBuffer(req.body)) {
            yield onBodyComplete(req.body);
          } else if (typeof req.body === "string") {
            yield onBodyComplete(Buffer.from(req.body, "utf-8"));
          } else {
            console.warn("[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for webhook event routes so that req.body is a raw buffer.");
            yield onBodyComplete(Buffer.from(JSON.stringify(req.body), "utf-8"));
          }
        } else {
          const chunks = [];
          req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          req.on("end", () => __awaiter(this, void 0, void 0, function* () {
            const rawBody = Buffer.concat(chunks);
            yield onBodyComplete(rawBody);
          }));
        }
      });
    }
    __name(verifyWebhookEventMiddleware, "verifyWebhookEventMiddleware");
    exports.verifyWebhookEventMiddleware = verifyWebhookEventMiddleware;
    __exportStar(require_components(), exports);
    __exportStar(require_webhooks(), exports);
  }
});

// src/index.ts
var import_discord_interactions = __toESM(require_dist());

// src/lib/discord.ts
var EPHEMERAL = 1 << 6;
var IS_COMPONENTS_V2 = 1 << 15;
var APPLICATION_COMMAND = 2;
var MESSAGE_COMPONENT = 3;
var MODAL_SUBMIT = 5;
var RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE = 4;
var RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5;
var RESPONSE_DEFERRED_UPDATE_MESSAGE = 6;
var RESPONSE_UPDATE_MESSAGE = 7;
var RESPONSE_MODAL = 9;
var APPLICATION_COMMAND_OPTION_STRING = 3;
var APPLICATION_COMMAND_OPTION_ATTACHMENT = 11;
var COMPONENT_ACTION_ROW = 1;
var COMPONENT_BUTTON = 2;
var COMPONENT_STRING_SELECT = 3;
var COMPONENT_TEXT_INPUT = 4;
var COMPONENT_SECTION = 9;
var COMPONENT_TEXT_DISPLAY = 10;
var COMPONENT_MEDIA_GALLERY = 12;
var COMPONENT_SEPARATOR = 14;
var COMPONENT_CONTAINER = 17;
var COMPONENT_LABEL = 18;
var BUTTON_SECONDARY = 2;
var TEXT_INPUT_SHORT = 1;
var TEXT_INPUT_PARAGRAPH = 2;
var GUILD_INSTALL = 0;
var USER_INSTALL = 1;
var GUILD_CONTEXT = 0;
var BOT_DM_CONTEXT = 1;
var PRIVATE_CHANNEL_CONTEXT = 2;
var USER_INSTALLABLE_CONTEXTS = {
  integration_types: [GUILD_INSTALL, USER_INSTALL],
  contexts: [GUILD_CONTEXT, BOT_DM_CONTEXT, PRIVATE_CHANNEL_CONTEXT]
};
var PLAYER_OPTION = {
  description: "Critical Ops name or player ID.",
  type: APPLICATION_COMMAND_OPTION_STRING,
  required: true,
  min_length: 1,
  max_length: 64
};
var PRIVATE_RESPONSE_OPTION_NAME = "private";
var PRIVATE_RESPONSE_OPTION = {
  name: PRIVATE_RESPONSE_OPTION_NAME,
  description: "Only you can see the command response.",
  type: APPLICATION_COMMAND_OPTION_STRING,
  required: false,
  choices: [
    {
      name: "True",
      value: "true"
    }
  ]
};
function withPrivateResponseOption(definition7) {
  const options = definition7.options || [];
  const hasPrivateOption = options.some((option) => {
    return typeof option === "object" && option !== null && "name" in option && option.name === PRIVATE_RESPONSE_OPTION_NAME;
  });
  if (hasPrivateOption) {
    return definition7;
  }
  return {
    ...definition7,
    options: [...options, PRIVATE_RESPONSE_OPTION]
  };
}
__name(withPrivateResponseOption, "withPrivateResponseOption");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function interactionResponse(data, type = RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE) {
  return jsonResponse({
    type,
    data
  });
}
__name(interactionResponse, "interactionResponse");
function withEphemeralFlag(data = {}) {
  return {
    ...data,
    flags: (data.flags || 0) | EPHEMERAL
  };
}
__name(withEphemeralFlag, "withEphemeralFlag");
function privateResponseRequested(interaction) {
  return interaction.data?.options?.some((option) => {
    return option.name === PRIVATE_RESPONSE_OPTION_NAME && (option.value === true || option.value === "true");
  }) || false;
}
__name(privateResponseRequested, "privateResponseRequested");
async function applyPrivateResponseOption(interaction, response) {
  if (!privateResponseRequested(interaction)) {
    return response;
  }
  try {
    const payload = await response.clone().json();
    if (payload.type === RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE) {
      return jsonResponse(
        {
          ...payload,
          data: {
            ...payload.data,
            flags: EPHEMERAL
          }
        },
        response.status
      );
    }
    if (payload.type === RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE) {
      return jsonResponse(
        {
          ...payload,
          data: withEphemeralFlag(payload.data)
        },
        response.status
      );
    }
  } catch {
    return response;
  }
  return response;
}
__name(applyPrivateResponseOption, "applyPrivateResponseOption");
function deferredInteractionResponse(data = {}) {
  return interactionResponse(data, RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
}
__name(deferredInteractionResponse, "deferredInteractionResponse");
function deferredUpdateMessageResponse() {
  return interactionResponse({}, RESPONSE_DEFERRED_UPDATE_MESSAGE);
}
__name(deferredUpdateMessageResponse, "deferredUpdateMessageResponse");
function modalResponse(data) {
  return interactionResponse(data, RESPONSE_MODAL);
}
__name(modalResponse, "modalResponse");
function runInBackground(runtime, job) {
  const promise = Promise.resolve().then(job);
  if (runtime?.waitUntil) {
    runtime.waitUntil(promise.catch((error) => console.error(error)));
  } else {
    promise.catch((error) => console.error(error));
  }
  return promise;
}
__name(runInBackground, "runInBackground");
function multipartPayload(payload, fileOrFiles) {
  const boundary = `discord-boundary-${crypto.randomUUID()}`;
  const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  const parts = [
    [
      `--${boundary}`,
      'Content-Disposition: form-data; name="payload_json"',
      "Content-Type: application/json",
      "",
      JSON.stringify(payload)
    ].join("\r\n")
  ];
  files.forEach((file, index) => {
    parts.push(
      [
        "",
        `--${boundary}`,
        `Content-Disposition: form-data; name="files[${index}]"; filename="${file.filename}"`,
        `Content-Type: ${file.contentType}`,
        "",
        ""
      ].join("\r\n"),
      file.body
    );
  });
  parts.push(`\r
--${boundary}--\r
`);
  const body = new Blob(parts);
  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}
__name(multipartPayload, "multipartPayload");
function updateMessageResponse(data) {
  return interactionResponse(data, RESPONSE_UPDATE_MESSAGE);
}
__name(updateMessageResponse, "updateMessageResponse");
function optionValue(options, name) {
  const value = options?.find((option) => option.name === name)?.value;
  return typeof value === "string" ? value.trim() : void 0;
}
__name(optionValue, "optionValue");
function optionAttachment(interaction, name) {
  const value = interaction.data?.options?.find((option) => option.name === name)?.value;
  const attachmentId = typeof value === "string" ? value : void 0;
  return attachmentId ? interaction.data?.resolved?.attachments?.[attachmentId] : void 0;
}
__name(optionAttachment, "optionAttachment");
function interactionUser(interaction) {
  return interaction.user || interaction.member?.user;
}
__name(interactionUser, "interactionUser");
function interactionUserId(interaction) {
  return interactionUser(interaction)?.id;
}
__name(interactionUserId, "interactionUserId");
function actionRow(components) {
  return {
    type: COMPONENT_ACTION_ROW,
    components
  };
}
__name(actionRow, "actionRow");
function textInput(customId2, style, options = {}) {
  return {
    type: COMPONENT_TEXT_INPUT,
    custom_id: customId2,
    style,
    min_length: options.minLength,
    max_length: options.maxLength,
    required: options.required ?? true,
    value: options.value
  };
}
__name(textInput, "textInput");
function labelComponent(label, component, description) {
  return {
    type: COMPONENT_LABEL,
    label,
    description,
    component
  };
}
__name(labelComponent, "labelComponent");
function findComponentValue(components, customId2) {
  for (const component of components || []) {
    if (component.custom_id === customId2 && typeof component.value === "string") {
      return component.value.trim();
    }
    const nested = findComponentValue(component.components, customId2);
    if (nested !== void 0) {
      return nested;
    }
    const labeled = findComponentValue(component.component ? [component.component] : void 0, customId2);
    if (labeled !== void 0) {
      return labeled;
    }
  }
  return void 0;
}
__name(findComponentValue, "findComponentValue");
function modalValue(interaction, customId2) {
  return findComponentValue(interaction.data?.components, customId2);
}
__name(modalValue, "modalValue");
function button(customId2, label, style = BUTTON_SECONDARY, disabled = false) {
  return {
    type: COMPONENT_BUTTON,
    custom_id: customId2,
    label,
    style,
    disabled
  };
}
__name(button, "button");
function stringSelect(customId2, placeholder, options) {
  return {
    type: COMPONENT_STRING_SELECT,
    custom_id: customId2,
    placeholder,
    min_values: 1,
    max_values: 1,
    options
  };
}
__name(stringSelect, "stringSelect");
function pageMenu(customId2, pageLabels, selectedIndex) {
  return [
    actionRow([
      stringSelect(
        customId2,
        "Pick a page",
        pageLabels.map((label, index) => ({
          label,
          value: String(index),
          default: index === selectedIndex
        }))
      )
    ])
  ];
}
__name(pageMenu, "pageMenu");
function discordBotToken(env) {
  return env.DISCORD_BOT_TOKEN || env.DISCORD_TOKEN;
}
__name(discordBotToken, "discordBotToken");
async function discordApi(env, route, init = {}) {
  const botToken = discordBotToken(env);
  if (!botToken) {
    throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_TOKEN");
  }
  const response = await fetch(`https://discord.com/api/v10/${route}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${botToken}`,
      ...init.headers || {}
    }
  });
  const text2 = await response.text();
  const data = text2 ? JSON.parse(text2) : void 0;
  if (!response.ok) {
    throw new Error(`Discord API ${route} failed: ${response.status} ${text2}`);
  }
  return data;
}
__name(discordApi, "discordApi");
async function editOriginalInteractionResponse(env, interactionToken, data, file) {
  if (!env.DISCORD_APPLICATION_ID || !interactionToken) {
    throw new Error("Missing interaction webhook credentials");
  }
  const route = `webhooks/${env.DISCORD_APPLICATION_ID}/${interactionToken}/messages/@original`;
  const usesComponentsV2 = Boolean((data.flags || 0) & IS_COMPONENTS_V2);
  const init = {
    method: "PATCH"
  };
  if (file) {
    const payload = multipartPayload(data, file);
    init.body = payload.body;
    init.headers = {
      "Content-Type": payload.contentType
    };
  } else {
    init.body = JSON.stringify(data);
    init.headers = {
      "Content-Type": "application/json"
    };
  }
  const response = await fetch(`https://discord.com/api/v10/${route}${usesComponentsV2 ? "?with_components=true" : ""}`, init);
  const text2 = await response.text();
  if (!response.ok) {
    throw new Error(`Discord webhook edit failed: ${response.status} ${text2}`);
  }
  return text2 ? JSON.parse(text2) : void 0;
}
__name(editOriginalInteractionResponse, "editOriginalInteractionResponse");
async function createDm(env, userId) {
  return discordApi(env, "users/@me/channels", {
    method: "POST",
    body: JSON.stringify({ recipient_id: userId })
  });
}
__name(createDm, "createDm");
async function sendDiscordMessage(env, channelId, data) {
  return discordApi(env, `channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      allowed_mentions: data.allowed_mentions || { parse: [] }
    })
  });
}
__name(sendDiscordMessage, "sendDiscordMessage");
async function sendDiscordDm(env, userId, data) {
  const dm = await createDm(env, userId);
  return sendDiscordMessage(env, dm.id, data);
}
__name(sendDiscordDm, "sendDiscordDm");

// src/lib/cops.ts
var COPS_PROFILE_API = "https://default.prod.copsapi.criticalforce.fi/api/public/profile";
var EMBED_COLOR = 16739105;
var PROFILE_CACHE_TTL_MS = 60 * 1e3;
var COPS_FETCH_TIMEOUT_MS = 6500;
var CLAN_CACHE_TTL_MS = 5 * 60 * 1e3;
var responseCache = /* @__PURE__ */ new Map();
function cached(key) {
  const entry = responseCache.get(key);
  if (!entry) {
    return void 0;
  }
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return void 0;
  }
  return entry.value;
}
__name(cached, "cached");
function remember(key, value, ttlMs) {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}
__name(remember, "remember");
function timeoutSignal(ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: /* @__PURE__ */ __name(() => clearTimeout(timeoutId), "clear")
  };
}
__name(timeoutSignal, "timeoutSignal");
function numberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
__name(numberOrZero, "numberOrZero");
function formatInteger(value) {
  return numberOrZero(value).toLocaleString("en-US");
}
__name(formatInteger, "formatInteger");
function formatOptionalInteger(value) {
  return typeof value === "number" && Number.isFinite(value) ? formatInteger(value) : "Unknown";
}
__name(formatOptionalInteger, "formatOptionalInteger");
function formatDecimal(value, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}
__name(formatDecimal, "formatDecimal");
function formatPercentValue(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}
__name(formatPercentValue, "formatPercentValue");
function ratio(numerator, denominator) {
  if (denominator === 0) {
    return numerator > 0 ? numerator : void 0;
  }
  return numerator / denominator;
}
__name(ratio, "ratio");
function kdValue(stats) {
  return ratio(numberOrZero(stats?.k), numberOrZero(stats?.d));
}
__name(kdValue, "kdValue");
function kdaValue(stats) {
  return ratio(numberOrZero(stats?.k) + numberOrZero(stats?.a), numberOrZero(stats?.d));
}
__name(kdaValue, "kdaValue");
function winRateValue(stats) {
  const games = matches(stats);
  return games > 0 ? numberOrZero(stats?.w) / games * 100 : void 0;
}
__name(winRateValue, "winRateValue");
function killsPerMatchValue(stats) {
  const games = matches(stats);
  return games > 0 ? numberOrZero(stats?.k) / games : void 0;
}
__name(killsPerMatchValue, "killsPerMatchValue");
function kd(stats) {
  const deaths = numberOrZero(stats?.d);
  const kills = numberOrZero(stats?.k);
  if (deaths === 0) {
    return kills > 0 ? "Perfect" : "0.00";
  }
  return formatDecimal(kills / deaths);
}
__name(kd, "kd");
function winRate(stats) {
  return formatPercentValue(winRateValue(stats));
}
__name(winRate, "winRate");
function matches(stats) {
  return numberOrZero(stats?.w) + numberOrZero(stats?.l);
}
__name(matches, "matches");
function hasStats(stats) {
  if (!stats) {
    return false;
  }
  return ["k", "d", "a", "w", "l"].some((key) => {
    return numberOrZero(stats[key]) > 0;
  });
}
__name(hasStats, "hasStats");
function addStats(left, right) {
  return {
    k: numberOrZero(left.k) + numberOrZero(right?.k),
    d: numberOrZero(left.d) + numberOrZero(right?.d),
    a: numberOrZero(left.a) + numberOrZero(right?.a),
    w: numberOrZero(left.w) + numberOrZero(right?.w),
    l: numberOrZero(left.l) + numberOrZero(right?.l)
  };
}
__name(addStats, "addStats");
function sumStats(seasons, mode) {
  return seasons.reduce((total, season) => {
    return addStats(total, season[mode]);
  }, {});
}
__name(sumStats, "sumStats");
function formatStats(stats) {
  return [
    `K/D/A: ${formatInteger(stats?.k)} / ${formatInteger(stats?.d)} / ${formatInteger(stats?.a)}`,
    `W-L: ${formatInteger(stats?.w)}-${formatInteger(stats?.l)}`,
    `K/D: ${kd(stats)} | Win rate: ${winRate(stats)}`
  ].join("\n");
}
__name(formatStats, "formatStats");
function rankFromMmr(mmr, apiRank, globalPosition) {
  if (apiRank === 9 || globalPosition && globalPosition > 0 && globalPosition <= 250) {
    return "Elite Ops";
  }
  if (mmr >= 2e3) {
    return "Spec Ops High";
  }
  if (mmr >= 1900) {
    return "Spec Ops Low";
  }
  if (mmr >= 1700) {
    return `Master ${Math.min(4, Math.floor((mmr - 1700) / 50) + 1)}`;
  }
  const tiers = [
    { name: "Iron", start: 0, end: 1199 },
    { name: "Bronze", start: 1200, end: 1299 },
    { name: "Silver", start: 1300, end: 1399 },
    { name: "Gold", start: 1400, end: 1499 },
    { name: "Platinum", start: 1500, end: 1599 },
    { name: "Diamond", start: 1600, end: 1699 }
  ];
  const tier = tiers.find((candidate) => mmr >= candidate.start && mmr <= candidate.end);
  if (!tier) {
    return "Unranked";
  }
  const division = Math.min(4, Math.floor((mmr - tier.start) / 25) + 1);
  return `${tier.name} ${division}`;
}
__name(rankFromMmr, "rankFromMmr");
function rankName(ranked) {
  if (!ranked) {
    return "No ranked data";
  }
  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  if (placementsLeft > 0 || ranked.rank === 0) {
    return `Calibrating`;
  }
  return rankFromMmr(numberOrZero(ranked.mmr), ranked.rank, ranked.global_position || void 0);
}
__name(rankName, "rankName");
var PEAK_RANK_LABELS = ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Spec Ops", "Elite Ops"];
function peakRankName(ranked) {
  const raw = ranked?.highest_rank;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return void 0;
  }
  const index = raw === 9 ? PEAK_RANK_LABELS.length - 1 : Math.max(0, Math.min(PEAK_RANK_LABELS.length - 1, Math.trunc(raw)));
  return index > 0 ? PEAK_RANK_LABELS[index] : void 0;
}
__name(peakRankName, "peakRankName");
function peakRankLine(ranked) {
  const peak = peakRankName(ranked);
  return peak ? `Peak: ${peak}` : void 0;
}
__name(peakRankLine, "peakRankLine");
function rankProgress(ranked) {
  if (!ranked) {
    return {
      percent: void 0,
      nextLabel: "No ranked data"
    };
  }
  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  if (placementsLeft > 0 || ranked.rank === 0) {
    return {
      percent: void 0,
      nextLabel: "Finish placements"
    };
  }
  const mmr = numberOrZero(ranked.mmr);
  const milestones = [
    { label: "Bronze", mmr: 1200 },
    { label: "Silver", mmr: 1300 },
    { label: "Gold", mmr: 1400 },
    { label: "Platinum", mmr: 1500 },
    { label: "Diamond", mmr: 1600 },
    { label: "Master", mmr: 1700 },
    { label: "Spec Ops", mmr: 1900 },
    { label: "Elite Ops", mmr: 2100 }
  ];
  const next = milestones.find((milestone) => mmr < milestone.mmr);
  const previous = [...milestones].reverse().find((milestone) => mmr >= milestone.mmr);
  const start = previous?.mmr ?? 0;
  const end = next?.mmr ?? Math.max(2200, mmr);
  const percent = end > start ? Math.min(100, Math.max(0, (mmr - start) / (end - start) * 100)) : 100;
  return {
    percent,
    nextLabel: next ? next.label : "Top ladder"
  };
}
__name(rankProgress, "rankProgress");
function formatRank(ranked) {
  if (!ranked) {
    return "No ranked data";
  }
  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  const mmr = numberOrZero(ranked.mmr);
  const globalPosition = ranked.global_position || void 0;
  if (placementsLeft > 0 || ranked.rank === 0) {
    return [`Rank: Calibrating (${placementsLeft} placement${placementsLeft === 1 ? "" : "s"} left)`, `MMR: ${formatInteger(mmr)}`].join(
      "\n"
    );
  }
  const leaderboard = globalPosition && globalPosition > 0 ? `
Leaderboard: #${formatInteger(globalPosition)}` : "";
  return [
    `Rank: ${rankName(ranked)}`,
    peakRankLine(ranked),
    `MMR: ${formatInteger(mmr)}${leaderboard}`,
    `Season W-L: ${formatInteger(ranked.wins)}-${formatInteger(ranked.losses)}`
  ].filter(Boolean).join("\n");
}
__name(formatRank, "formatRank");
function displayName(profile) {
  return profile.basicInfo?.name || "Unknown player";
}
__name(displayName, "displayName");
function playerId(profile) {
  return profile.basicInfo?.userID ? String(profile.basicInfo.userID) : void 0;
}
__name(playerId, "playerId");
function formatClanMembership(profile) {
  if (!profile.clan) {
    return "Not in a clan";
  }
  const name = profile.clan.basicInfo?.name || "Unknown clan";
  const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : "";
  const role = numberOrZero(profile.clan.memberRank) >= 40 ? "Owner" : "Member";
  return `${tag}${name}
Role: ${role}`;
}
__name(formatClanMembership, "formatClanMembership");
function clanLine(profile) {
  if (!profile.clan) {
    return "No clan";
  }
  const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : "";
  return `${tag}${profile.clan.basicInfo?.name || "Unknown clan"}`;
}
__name(clanLine, "clanLine");
function firstBoolean(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "1"].includes(normalized)) {
        return true;
      }
      if (["false", "no", "0"].includes(normalized)) {
        return false;
      }
    }
  }
  return void 0;
}
__name(firstBoolean, "firstBoolean");
function firstString(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return void 0;
}
__name(firstString, "firstString");
function firstNumber(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return void 0;
}
__name(firstNumber, "firstNumber");
function parseTimestampSeconds(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1e10 ? Math.floor(value / 1e3) : Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return parseTimestampSeconds(numeric);
    }
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed / 1e3);
    }
  }
  return void 0;
}
__name(parseTimestampSeconds, "parseTimestampSeconds");
var LAST_ONLINE_TIMESTAMP_KEYS = [
  "lastSeenTime",
  "last_seen_time",
  "lastSeenAt",
  "last_seen_at",
  "lastOnline",
  "last_online",
  "lastOnlineAt",
  "last_online_at",
  "LastSeenTime",
  "LastOnline"
];
var DISCORD_TIMESTAMP_STYLES = /* @__PURE__ */ new Set(["t", "T", "d", "D", "f", "F", "R"]);
function firstTimestampSeconds(source, keys) {
  for (const key of keys) {
    const parsed = parseTimestampSeconds(source[key]);
    if (parsed) {
      return parsed;
    }
  }
  return void 0;
}
__name(firstTimestampSeconds, "firstTimestampSeconds");
function profileLastOnlineSeconds(profile) {
  const basicInfo = profile.basicInfo;
  if (!basicInfo) {
    return void 0;
  }
  const seconds = firstTimestampSeconds(basicInfo, LAST_ONLINE_TIMESTAMP_KEYS);
  if (!seconds || seconds <= 0) {
    return void 0;
  }
  const now = Math.floor(Date.now() / 1e3);
  return seconds <= now + 5 * 60 ? seconds : void 0;
}
__name(profileLastOnlineSeconds, "profileLastOnlineSeconds");
function discordTimestamp(seconds, style = "R") {
  const normalizedStyle = DISCORD_TIMESTAMP_STYLES.has(style) ? style : "R";
  return `<t:${Math.floor(seconds)}:${normalizedStyle}>`;
}
__name(discordTimestamp, "discordTimestamp");
function formatLastOnline(profile, fallback, style = "R") {
  const seconds = profileLastOnlineSeconds(profile);
  return seconds ? discordTimestamp(seconds, style) : fallback;
}
__name(formatLastOnline, "formatLastOnline");
function formatLastOnlineValue(value, fallback, style = "R") {
  const seconds = parseTimestampSeconds(value);
  return seconds && seconds > 0 ? discordTimestamp(seconds, style) : fallback;
}
__name(formatLastOnlineValue, "formatLastOnlineValue");
function profileLastOnlineIso(profile) {
  const seconds = profileLastOnlineSeconds(profile);
  return seconds ? new Date(seconds * 1e3).toISOString() : void 0;
}
__name(profileLastOnlineIso, "profileLastOnlineIso");
var BAN_END_TIMESTAMP_KEYS = [
  "ExpiresAt",
  "expiresAt",
  "expires_at",
  "ExpirationTime",
  "expirationTime",
  "expiration_time",
  "EndTime",
  "endTime",
  "end_time",
  "Until",
  "until",
  "BanEndsAt",
  "banEndsAt",
  "ban_ends_at",
  "UnbanTime",
  "unbanTime",
  "unban_time",
  "Expires",
  "expires"
];
var BAN_SECONDS_LEFT_KEYS = [
  "SecondsLeft",
  "secondsLeft",
  "seconds_left",
  "TimeLeft",
  "timeLeft",
  "time_left",
  "RemainingSeconds",
  "remainingSeconds",
  "remaining_seconds"
];
var BAN_TYPE_KEYS = ["Type", "type", "BanType", "banType", "ban_type"];
var BAN_REASON_KEYS = ["Reason", "reason", "BanReason", "banReason", "ban_reason"];
var BAN_PERMANENT_TEXT_KEYS = [
  "Duration",
  "duration",
  "BanDuration",
  "banDuration",
  "ban_duration",
  "Type",
  "type",
  "BanType",
  "banType",
  "ban_type"
];
function compactDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.max(1, Math.floor(seconds % 3600 / 60));
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}
__name(compactDuration, "compactDuration");
function banSecondsLeft(ban) {
  if (!ban || typeof ban !== "object") {
    return void 0;
  }
  const seconds = firstNumber(ban, BAN_SECONDS_LEFT_KEYS);
  return typeof seconds === "number" ? Math.max(0, Math.floor(seconds)) : void 0;
}
__name(banSecondsLeft, "banSecondsLeft");
function activeBanFlag(data) {
  return firstBoolean(data, ["active", "isActive", "is_active", "banned", "isBanned", "is_banned"]);
}
__name(activeBanFlag, "activeBanFlag");
function banType(data) {
  return firstNumber(data, BAN_TYPE_KEYS);
}
__name(banType, "banType");
function banReasonSignal(data) {
  const numericReason = firstNumber(data, BAN_REASON_KEYS);
  if (typeof numericReason === "number") {
    return numericReason > 0;
  }
  const textReason = firstString(data, BAN_REASON_KEYS);
  return Boolean(textReason && !/^(none|no(ne)?|0)$/i.test(textReason));
}
__name(banReasonSignal, "banReasonSignal");
function hasBanStatusSignal(data) {
  const active = activeBanFlag(data);
  if (active === true) {
    return true;
  }
  const type = banType(data);
  return typeof type === "number" && type > 0 || banReasonSignal(data);
}
__name(hasBanStatusSignal, "hasBanStatusSignal");
function activeBanEndsAtSeconds(ban, now = Date.now()) {
  if (!ban || typeof ban !== "object") {
    return void 0;
  }
  const data = ban;
  const timestamp2 = firstTimestampSeconds(data, BAN_END_TIMESTAMP_KEYS);
  if (timestamp2) {
    return timestamp2;
  }
  const secondsLeft = banSecondsLeft(data);
  return secondsLeft !== void 0 && secondsLeft > 0 ? Math.floor(now / 1e3) + secondsLeft : void 0;
}
__name(activeBanEndsAtSeconds, "activeBanEndsAtSeconds");
function formatBanDurationLeft(ban, now = Date.now()) {
  const secondsLeft = banSecondsLeft(ban);
  if (secondsLeft !== void 0) {
    return secondsLeft > 0 ? compactDuration(secondsLeft) : void 0;
  }
  const endsAt = activeBanEndsAtSeconds(ban, now);
  const nowSeconds = Math.floor(now / 1e3);
  if (!endsAt || endsAt <= nowSeconds) {
    return void 0;
  }
  return compactDuration(endsAt - nowSeconds);
}
__name(formatBanDurationLeft, "formatBanDurationLeft");
function isPermanentBan(ban) {
  if (!ban || typeof ban !== "object") {
    return false;
  }
  const data = ban;
  if (activeBanFlag(data) === false) {
    return false;
  }
  if (firstBoolean(data, ["permanent", "isPermanent", "is_permanent"]) === true) {
    return true;
  }
  const durationText = firstString(data, BAN_PERMANENT_TEXT_KEYS);
  if (durationText && /permanent|perm/i.test(durationText)) {
    return true;
  }
  const secondsLeft = banSecondsLeft(data);
  const hasEndTimestamp = firstTimestampSeconds(data, BAN_END_TIMESTAMP_KEYS) !== void 0;
  return secondsLeft !== void 0 && secondsLeft <= 0 && !hasEndTimestamp && hasBanStatusSignal(data);
}
__name(isPermanentBan, "isPermanentBan");
function formatBan(ban) {
  if (!ban) {
    return "No active ban";
  }
  if (typeof ban === "string") {
    return ban;
  }
  if (typeof ban !== "object") {
    return "Active ban";
  }
  const data = ban;
  if (activeBanFlag(data) === false) {
    return "No active ban";
  }
  const secondsLeft = banSecondsLeft(data);
  const permanent = isPermanentBan(data);
  if (secondsLeft !== void 0 && secondsLeft <= 0 && !permanent && !hasBanStatusSignal(data)) {
    return "No active ban";
  }
  const endsAt = activeBanEndsAtSeconds(data);
  if (endsAt && endsAt > Math.floor(Date.now() / 1e3)) {
    const timeLeft = formatBanDurationLeft(data);
    return `Banned
Time left: ${timeLeft || "less than 1m"}
Ends: <t:${endsAt}:R> (<t:${endsAt}:f>)`;
  }
  if (permanent || !endsAt) {
    return `Banned
Duration: ${permanent ? "Permanent" : "Active"}`;
  }
  return `Banned
End time: <t:${endsAt}:f>`;
}
__name(formatBan, "formatBan");
function hasActiveBan(ban) {
  if (!ban) {
    return false;
  }
  if (typeof ban === "string") {
    const normalized = ban.trim().toLowerCase();
    return Boolean(normalized) && !/^no\s+(active\s+)?ban/.test(normalized);
  }
  if (typeof ban !== "object") {
    return true;
  }
  const data = ban;
  const active = activeBanFlag(data);
  if (active === false) {
    return false;
  }
  if (isPermanentBan(data)) {
    return true;
  }
  const secondsLeft = banSecondsLeft(data);
  if (secondsLeft !== void 0) {
    return secondsLeft > 0 || hasBanStatusSignal(data);
  }
  const endsAt = activeBanEndsAtSeconds(data);
  return endsAt ? endsAt > Math.floor(Date.now() / 1e3) : true;
}
__name(hasActiveBan, "hasActiveBan");
function accountCreatedEstimate(seasons) {
  const firstSeason = seasons.reduce((earliest, season) => {
    if (typeof season.season !== "number" || !hasStats(season.ranked) && !hasStats(season.casual) && !hasStats(season.custom)) {
      return earliest;
    }
    return earliest === void 0 ? season.season : Math.min(earliest, season.season);
  }, void 0);
  if (typeof firstSeason !== "number") {
    return "No public stat history";
  }
  return `Account appears to have been created around Season ${firstSeason}`;
}
__name(accountCreatedEstimate, "accountCreatedEstimate");
function currentSeason(seasons) {
  return seasons.reduce((latest, season) => {
    if (typeof season.season !== "number") {
      return latest;
    }
    return latest === void 0 ? season.season : Math.max(latest, season.season);
  }, void 0);
}
__name(currentSeason, "currentSeason");
function seasonByNumber(seasons, seasonNumber) {
  return seasons.find((season) => season.season === seasonNumber);
}
__name(seasonByNumber, "seasonByNumber");
function latestSeason(profile) {
  const seasons = profile.stats?.seasonal_stats ?? [];
  return seasonByNumber(seasons, currentSeason(seasons));
}
__name(latestSeason, "latestSeason");
function fieldValue(value) {
  return value.length > 1024 ? `${value.slice(0, 1021)}...` : value;
}
__name(fieldValue, "fieldValue");
function playerLookupFromValue(value) {
  return /^\d+$/.test(value) ? { playerId: value } : { ign: value };
}
__name(playerLookupFromValue, "playerLookupFromValue");
function statField(name, stats, inline = true) {
  return {
    name,
    value: fieldValue(
      formatStats(stats).split("\n").map((line) => `> - ${line}`).join("\n")
    ),
    inline
  };
}
__name(statField, "statField");
async function fetchCriticalOpsProfile(lookup) {
  const params = lookup.playerId ? `ids=${encodeURIComponent(lookup.playerId)}` : `usernames=${encodeURIComponent(lookup.ign || "")}`;
  const url = `${COPS_PROFILE_API}?${params}`;
  const cacheKey = `profile:${url}`;
  const cachedProfile = cached(cacheKey);
  if (cachedProfile) {
    return cachedProfile;
  }
  const timeout = timeoutSignal(COPS_FETCH_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: timeout.signal
    });
  } finally {
    timeout.clear();
  }
  if (!response.ok) {
    if (response.status === 500 || response.status === 404) {
      return void 0;
    }
    throw new Error(`Critical Ops API returned ${response.status}`);
  }
  const profiles = await response.json();
  const profile = profiles[0];
  if (profile) {
    remember(cacheKey, profile, PROFILE_CACHE_TTL_MS);
  }
  return profile;
}
__name(fetchCriticalOpsProfile, "fetchCriticalOpsProfile");
async function fetchProfileByPlayerOption(player) {
  return fetchCriticalOpsProfile(playerLookupFromValue(player));
}
__name(fetchProfileByPlayerOption, "fetchProfileByPlayerOption");

// src/lib/brand.ts
var DEFAULT_SUPPORT_SERVER_URL = "https://discord.gg/QW7CZczhT4";
var DEVELOPER_HANDLES = ["@xepp._."];
var DEVELOPER_CREDIT = `MADE BY ${DEVELOPER_HANDLES.join(" / ")}`;
function supportServerUrl(env) {
  return env?.SUPPORT_SERVER_URL?.trim() || DEFAULT_SUPPORT_SERVER_URL;
}
__name(supportServerUrl, "supportServerUrl");
function compactUrlLabel(url) {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/g, "");
}
__name(compactUrlLabel, "compactUrlLabel");
function supportServerLabel(env) {
  return compactUrlLabel(supportServerUrl(env));
}
__name(supportServerLabel, "supportServerLabel");

// src/lib/player-tags.ts
var PLAYER_TAG_IDS = ["verified", "partner", "developer", "creator", "competitive", "organizer"];
var SECURE_STATUS_COLOR = "#11d1d6";
var REPORT_STATUS_COLOR = "#ff3b30";
var PLAYER_TAG_DEFINITIONS = [
  {
    id: "verified",
    label: "Verified",
    description: "Known and trusted by the Patch team.",
    color: "#f6c945",
    embedColor: 16173381,
    icon: "badge-check",
    priority: 10
  },
  {
    id: "partner",
    label: "Partner",
    description: "Official Patch partner.",
    color: "#38bdf8",
    embedColor: 3718648,
    icon: "handshake",
    priority: 15
  },
  {
    id: "developer",
    label: "Developer",
    description: "Critical Ops developer.",
    color: "#c084fc",
    embedColor: 12616956,
    icon: "code-2",
    priority: 20
  },
  {
    id: "creator",
    label: "Creator",
    description: "Content creator.",
    color: "#f472b6",
    embedColor: 16020150,
    icon: "clapperboard",
    priority: 30
  },
  {
    id: "competitive",
    label: "Competitive",
    description: "Competitive player.",
    color: "#65d66e",
    embedColor: 6674030,
    icon: "swords",
    priority: 40
  },
  {
    id: "organizer",
    label: "Organizer",
    description: "Hosts official tournaments or events.",
    color: "#f59e0b",
    embedColor: 16096779,
    icon: "calendar-days",
    priority: 50
  }
];
var PLAYER_TAG_BY_ID = Object.fromEntries(PLAYER_TAG_DEFINITIONS.map((tag) => [tag.id, tag]));
function parsePlayerTagId(value) {
  return PLAYER_TAG_IDS.find((tagId) => tagId === value);
}
__name(parsePlayerTagId, "parsePlayerTagId");
function normalizePlayerTagIds(tags) {
  const unique = /* @__PURE__ */ new Set();
  for (const tag of tags || []) {
    const tagId = parsePlayerTagId(tag);
    if (tagId) {
      unique.add(tagId);
    }
  }
  return Array.from(unique).sort((a, b) => PLAYER_TAG_BY_ID[a].priority - PLAYER_TAG_BY_ID[b].priority);
}
__name(normalizePlayerTagIds, "normalizePlayerTagIds");
function playerTagDefinitions(tags) {
  return normalizePlayerTagIds(tags).map((tagId) => PLAYER_TAG_BY_ID[tagId]);
}
__name(playerTagDefinitions, "playerTagDefinitions");
function publicStatusFor(report, tags) {
  if (report) {
    return {
      kind: "report",
      label: "Community report",
      reportReason: report.reason,
      color: REPORT_STATUS_COLOR,
      embedColor: 16726832,
      icon: "shield-alert"
    };
  }
  const definitions = playerTagDefinitions(tags);
  if (definitions.length > 0) {
    const primary = definitions[0];
    return {
      kind: "tags",
      label: definitions.map((tag) => tag.label).join(", "),
      tags: definitions,
      color: primary.color,
      embedColor: primary.embedColor,
      icon: primary.icon
    };
  }
  return {
    kind: "secure",
    label: "Secure",
    color: SECURE_STATUS_COLOR,
    embedColor: 1167830,
    icon: "shield-check"
  };
}
__name(publicStatusFor, "publicStatusFor");

// src/lib/storage.ts
function requireKv(env) {
  if (!env.USER_PREFERENCES) {
    throw new Error("Missing USER_PREFERENCES KV binding");
  }
  return env.USER_PREFERENCES;
}
__name(requireKv, "requireKv");
function trackerKey(userId) {
  return `track:${userId}`;
}
__name(trackerKey, "trackerKey");
function acceptedReportKey(targetPlayerId) {
  return `report:accepted:${targetPlayerId}`;
}
__name(acceptedReportKey, "acceptedReportKey");
function playerTagsKey(targetPlayerId) {
  return `player:tags:${targetPlayerId}`;
}
__name(playerTagsKey, "playerTagsKey");
function playerLookupCountKey(targetPlayerId) {
  return `player:lookup-count:${targetPlayerId}`;
}
__name(playerLookupCountKey, "playerLookupCountKey");
function onboardingKey(userId) {
  return `onboarding:${userId}`;
}
__name(onboardingKey, "onboardingKey");
function pendingReportKey(reportId) {
  return `report:pending:${reportId}`;
}
__name(pendingReportKey, "pendingReportKey");
function reportDraftKey(reportId) {
  return `report:draft:${reportId}`;
}
__name(reportDraftKey, "reportDraftKey");
function reportBlacklistKey(userId) {
  return `report:blacklist:${userId}`;
}
__name(reportBlacklistKey, "reportBlacklistKey");
function reportCooldownKey(userId) {
  return `report:cooldown:${userId}`;
}
__name(reportCooldownKey, "reportCooldownKey");
function reporterReputationKey(userId) {
  return `report:reputation:${userId}`;
}
__name(reporterReputationKey, "reporterReputationKey");
function monthlyCommunityRecapKey(month) {
  return `community:recap:${month}`;
}
__name(monthlyCommunityRecapKey, "monthlyCommunityRecapKey");
function reporterTierLabel(tier) {
  if (tier === "trusted_reporter") return "Trusted Reporter";
  if (tier === "community_scout") return "Community Scout";
  if (tier === "evidence_builder") return "Evidence Builder";
  return "New Reporter";
}
__name(reporterTierLabel, "reporterTierLabel");
function emptyReporterReputation(userId) {
  return {
    userId,
    submittedReports: 0,
    acceptedReports: 0,
    rejectedReports: 0,
    banConfirmedReports: 0,
    tier: "new_reporter",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(emptyReporterReputation, "emptyReporterReputation");
function normalizeReportStatus(status) {
  if (status === "pending" || status === "accepted" || status === "rejected" || status === "ban_confirmed") {
    return status;
  }
  return "pending";
}
__name(normalizeReportStatus, "normalizeReportStatus");
function normalizePendingReport(report) {
  return {
    ...report,
    status: normalizeReportStatus(report.status)
  };
}
__name(normalizePendingReport, "normalizePendingReport");
function computeReporterTier(record) {
  const accepted = Math.max(0, Math.floor(record.acceptedReports || 0));
  const rejected = Math.max(0, Math.floor(record.rejectedReports || 0));
  const banConfirmed = Math.max(0, Math.floor(record.banConfirmedReports || 0));
  if (rejected >= 3 && rejected > accepted + banConfirmed) {
    return "evidence_builder";
  }
  if (banConfirmed >= 2 || accepted >= 5 && accepted >= rejected + 2) {
    return "trusted_reporter";
  }
  if (banConfirmed >= 1 || accepted >= 2) {
    return "community_scout";
  }
  return "new_reporter";
}
__name(computeReporterTier, "computeReporterTier");
function normalizeReporterReputation(record) {
  const normalized = {
    ...emptyReporterReputation(record.userId),
    ...record,
    submittedReports: Math.max(0, Math.floor(record.submittedReports || 0)),
    acceptedReports: Math.max(0, Math.floor(record.acceptedReports || 0)),
    rejectedReports: Math.max(0, Math.floor(record.rejectedReports || 0)),
    banConfirmedReports: Math.max(0, Math.floor(record.banConfirmedReports || 0))
  };
  return {
    ...normalized,
    tier: computeReporterTier(normalized)
  };
}
__name(normalizeReporterReputation, "normalizeReporterReputation");
function reporterReputationFromReports(userId, reports) {
  const record = emptyReporterReputation(userId);
  for (const report of reports) {
    if (report.reporterId !== userId) {
      continue;
    }
    record.submittedReports += 1;
    record.lastReportAt = [record.lastReportAt, report.createdAt].filter(Boolean).sort().at(-1);
    if (report.status === "accepted" || report.status === "ban_confirmed") {
      record.acceptedReports += 1;
      record.lastAcceptedAt = [record.lastAcceptedAt, report.reviewedAt].filter(Boolean).sort().at(-1);
    }
    if (report.status === "rejected") {
      record.rejectedReports += 1;
      record.lastRejectedAt = [record.lastRejectedAt, report.reviewedAt].filter(Boolean).sort().at(-1);
    }
    if (report.status === "ban_confirmed" || report.banConfirmedAt) {
      record.banConfirmedReports += 1;
      record.lastBanConfirmedAt = [record.lastBanConfirmedAt, report.banConfirmedAt].filter(Boolean).sort().at(-1);
    }
  }
  return normalizeReporterReputation(record);
}
__name(reporterReputationFromReports, "reporterReputationFromReports");
function reporterIsTrustedForSignals(reputation) {
  return reputation?.tier === "community_scout" || reputation?.tier === "trusted_reporter";
}
__name(reporterIsTrustedForSignals, "reporterIsTrustedForSignals");
async function getTracker(env, userId) {
  const stored = await requireKv(env).get(trackerKey(userId), "json");
  if (stored && typeof stored === "object") {
    return normalizeTrackerRecord(stored);
  }
  return {
    userId,
    players: [],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(getTracker, "getTracker");
async function putTracker(env, record) {
  await requireKv(env).put(
    trackerKey(record.userId),
    JSON.stringify({
      ...record,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    })
  );
}
__name(putTracker, "putTracker");
function normalizeTrackedPlayer(player) {
  const latestSnapshot = player.latestSnapshot || player.lastSnapshot;
  const baselineSnapshot = player.baselineSnapshot || player.lastSnapshot || latestSnapshot;
  return {
    ...player,
    latestSnapshot,
    baselineSnapshot,
    lastSnapshot: latestSnapshot,
    lastRefreshedAt: player.lastRefreshedAt || latestSnapshot?.capturedAt,
    lastViewedAt: player.lastViewedAt || baselineSnapshot?.capturedAt
  };
}
__name(normalizeTrackedPlayer, "normalizeTrackedPlayer");
function normalizeTrackerRecord(record) {
  return {
    ...record,
    players: (record.players || []).map(normalizeTrackedPlayer),
    lastRefreshedAt: record.lastRefreshedAt || record.players?.map((player) => player.lastRefreshedAt || player.lastSnapshot?.capturedAt).filter(Boolean).sort().at(-1),
    lastViewedAt: record.lastViewedAt || record.players?.map((player) => player.lastViewedAt || player.lastSnapshot?.capturedAt).filter(Boolean).sort().at(-1)
  };
}
__name(normalizeTrackerRecord, "normalizeTrackerRecord");
async function getOnboardingRecord(env, userId) {
  if (!env.USER_PREFERENCES) {
    return void 0;
  }
  const record = await env.USER_PREFERENCES.get(onboardingKey(userId), "json");
  return record && typeof record === "object" ? record : void 0;
}
__name(getOnboardingRecord, "getOnboardingRecord");
async function markOnboardingStarted(env, userId, firstCommand) {
  const record = {
    userId,
    firstCommand,
    startedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await requireKv(env).put(onboardingKey(userId), JSON.stringify(record));
  return record;
}
__name(markOnboardingStarted, "markOnboardingStarted");
async function listTrackers(env) {
  const kv = requireKv(env);
  const records = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: "track:", cursor });
    await Promise.all(
      page.keys.map(async (key) => {
        const record = await kv.get(key.name, "json");
        if (record && typeof record === "object") {
          records.push(record);
        }
      })
    );
    cursor = page.list_complete ? void 0 : page.cursor;
  } while (cursor);
  return records;
}
__name(listTrackers, "listTrackers");
function snapshotProfile(profile) {
  const season = latestSeason(profile);
  return {
    capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
    season: season?.season,
    kills: Number(season?.ranked?.k || 0),
    deaths: Number(season?.ranked?.d || 0),
    mmr: profile.stats?.ranked?.mmr,
    rank: rankName(profile.stats?.ranked),
    peakRank: peakRankName(profile.stats?.ranked),
    lastOnlineAt: profileLastOnlineIso(profile),
    level: profile.basicInfo?.playerLevel?.level
  };
}
__name(snapshotProfile, "snapshotProfile");
function trackedPlayerFromProfile(lookup, profile) {
  const id = playerId(profile);
  const snapshot = snapshotProfile(profile);
  return {
    key: id || lookup.toLowerCase(),
    lookup: id || lookup,
    label: displayName(profile),
    playerId: id,
    latestSnapshot: snapshot,
    baselineSnapshot: snapshot,
    lastSnapshot: snapshot,
    addedAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastViewedAt: snapshot.capturedAt,
    lastRefreshedAt: snapshot.capturedAt
  };
}
__name(trackedPlayerFromProfile, "trackedPlayerFromProfile");
function snapshotDelta(previous, next) {
  const diff = /* @__PURE__ */ __name((a, b) => typeof a === "number" && typeof b === "number" ? b - a : void 0, "diff");
  return {
    kills: diff(previous?.kills, next.kills),
    deaths: diff(previous?.deaths, next.deaths),
    mmr: diff(previous?.mmr, next.mmr),
    level: diff(previous?.level, next.level),
    rankChanged: previous?.rank && previous.rank !== next.rank
  };
}
__name(snapshotDelta, "snapshotDelta");
async function createPendingReport(env, report) {
  const pending = {
    ...report,
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await recordReportSubmitted(env, pending.reporterId, pending.createdAt);
  await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(pending));
  return pending;
}
__name(createPendingReport, "createPendingReport");
async function createReportDraft(env, draft) {
  const stored = {
    ...draft,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await requireKv(env).put(reportDraftKey(stored.id), JSON.stringify(stored), {
    expirationTtl: 15 * 60
  });
  return stored;
}
__name(createReportDraft, "createReportDraft");
async function getReportDraft(env, draftId) {
  const draft = await requireKv(env).get(reportDraftKey(draftId), "json");
  return draft && typeof draft === "object" ? draft : void 0;
}
__name(getReportDraft, "getReportDraft");
async function deleteReportDraft(env, draftId) {
  await requireKv(env).delete(reportDraftKey(draftId));
}
__name(deleteReportDraft, "deleteReportDraft");
async function getPendingReport(env, reportId) {
  const report = await requireKv(env).get(pendingReportKey(reportId), "json");
  return report && typeof report === "object" ? normalizePendingReport(report) : void 0;
}
__name(getPendingReport, "getPendingReport");
async function putPendingReport(env, report) {
  await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(normalizePendingReport(report)));
}
__name(putPendingReport, "putPendingReport");
async function listReports(env) {
  const kv = requireKv(env);
  const reports = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: "report:pending:", cursor });
    await Promise.all(
      page.keys.map(async (key) => {
        const report = await kv.get(key.name, "json");
        if (report && typeof report === "object") {
          reports.push(normalizePendingReport(report));
        }
      })
    );
    cursor = page.list_complete ? void 0 : page.cursor;
  } while (cursor);
  return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
__name(listReports, "listReports");
async function putAcceptedReport(env, report) {
  await requireKv(env).put(acceptedReportKey(report.playerId), JSON.stringify(report));
}
__name(putAcceptedReport, "putAcceptedReport");
async function listAcceptedReports(env) {
  const kv = requireKv(env);
  const reports = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: "report:accepted:", cursor });
    await Promise.all(
      page.keys.map(async (key) => {
        const report = await kv.get(key.name, "json");
        if (report && typeof report === "object") {
          reports.push(report);
        }
      })
    );
    cursor = page.list_complete ? void 0 : page.cursor;
  } while (cursor);
  return reports;
}
__name(listAcceptedReports, "listAcceptedReports");
async function acceptReport(env, report, reviewerId, publicReason, reviewerNote) {
  const accepted = {
    ...report,
    publicReason,
    reviewerNote,
    status: "accepted",
    reviewedBy: reviewerId,
    reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (report.status !== "accepted" && report.status !== "ban_confirmed") {
    await recordReportAccepted(env, accepted.reporterId, accepted.reviewedAt);
  }
  await putPendingReport(env, accepted);
  const playerReport = {
    reportId: accepted.id,
    playerId: accepted.targetPlayerId,
    playerName: accepted.targetName,
    reason: publicReason,
    reporterId: accepted.reporterId,
    acceptedBy: reviewerId,
    acceptedAt: accepted.reviewedAt,
    reviewerNote
  };
  await putAcceptedReport(env, playerReport);
  return accepted;
}
__name(acceptReport, "acceptReport");
async function rejectReport(env, report, reviewerId, publicReason, reviewerNote) {
  const rejected = {
    ...report,
    publicReason,
    reviewerNote,
    status: "rejected",
    reviewedBy: reviewerId,
    reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (report.status !== "rejected") {
    await recordReportRejected(env, rejected.reporterId, rejected.reviewedAt);
  }
  await putPendingReport(env, rejected);
  return rejected;
}
__name(rejectReport, "rejectReport");
async function markPendingReportBanConfirmed(env, reportId, confirmedAt) {
  const report = await getPendingReport(env, reportId);
  if (!report) {
    return void 0;
  }
  const alreadyConfirmed = report.status === "ban_confirmed" || Boolean(report.banConfirmedAt);
  const confirmed = {
    ...report,
    status: "ban_confirmed",
    banConfirmedAt: report.banConfirmedAt || confirmedAt
  };
  if (!alreadyConfirmed) {
    await recordReportBanConfirmed(env, report.reporterId, confirmedAt);
  }
  await putPendingReport(env, confirmed);
  return confirmed;
}
__name(markPendingReportBanConfirmed, "markPendingReportBanConfirmed");
async function getAcceptedReport(env, targetPlayerId) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return void 0;
  }
  const report = await env.USER_PREFERENCES.get(acceptedReportKey(targetPlayerId), "json");
  return report && typeof report === "object" ? report : void 0;
}
__name(getAcceptedReport, "getAcceptedReport");
async function deleteAcceptedReport(env, targetPlayerId) {
  await requireKv(env).delete(acceptedReportKey(targetPlayerId));
}
__name(deleteAcceptedReport, "deleteAcceptedReport");
async function getPlayerTagRecord(env, targetPlayerId) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return void 0;
  }
  const record = await env.USER_PREFERENCES.get(playerTagsKey(targetPlayerId), "json");
  if (!record || typeof record !== "object") {
    return void 0;
  }
  const stored = record;
  return {
    ...stored,
    tags: normalizePlayerTagIds(stored.tags)
  };
}
__name(getPlayerTagRecord, "getPlayerTagRecord");
async function getPlayerLookupCount(env, targetPlayerId) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return void 0;
  }
  const record = await env.USER_PREFERENCES.get(playerLookupCountKey(targetPlayerId), "json");
  if (!record || typeof record !== "object") {
    return 0;
  }
  const stored = record;
  return typeof stored.count === "number" && Number.isFinite(stored.count) ? Math.max(0, Math.floor(stored.count)) : 0;
}
__name(getPlayerLookupCount, "getPlayerLookupCount");
async function incrementPlayerLookupCount(env, targetPlayerId, targetName) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return void 0;
  }
  const count = await getPlayerLookupCount(env, targetPlayerId) ?? 0;
  const record = {
    playerId: targetPlayerId,
    playerName: targetName,
    count: count + 1,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await env.USER_PREFERENCES.put(playerLookupCountKey(targetPlayerId), JSON.stringify(record));
  return record.count;
}
__name(incrementPlayerLookupCount, "incrementPlayerLookupCount");
async function addPlayerTag(env, targetPlayerId, targetName, tag, updatedBy) {
  const existing = await getPlayerTagRecord(env, targetPlayerId);
  const record = {
    playerId: targetPlayerId,
    playerName: targetName,
    tags: normalizePlayerTagIds([...existing?.tags || [], tag]),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy
  };
  await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
  return record;
}
__name(addPlayerTag, "addPlayerTag");
async function removePlayerTag(env, targetPlayerId, tag, updatedBy) {
  const existing = await getPlayerTagRecord(env, targetPlayerId);
  if (!existing) {
    return void 0;
  }
  const tags = tag ? normalizePlayerTagIds(existing.tags.filter((tagId) => tagId !== tag)) : [];
  if (tags.length === 0) {
    await requireKv(env).delete(playerTagsKey(targetPlayerId));
    return void 0;
  }
  const record = {
    ...existing,
    tags,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy
  };
  await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
  return record;
}
__name(removePlayerTag, "removePlayerTag");
async function getReportBlacklistEntry(env, userId) {
  const entry = await requireKv(env).get(reportBlacklistKey(userId), "json");
  return entry && typeof entry === "object" ? entry : void 0;
}
__name(getReportBlacklistEntry, "getReportBlacklistEntry");
async function putReportBlacklistEntry(env, userId, createdBy, reason) {
  const entry = {
    userId,
    createdBy,
    reason,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await requireKv(env).put(reportBlacklistKey(userId), JSON.stringify(entry));
  return entry;
}
__name(putReportBlacklistEntry, "putReportBlacklistEntry");
async function deleteReportBlacklistEntry(env, userId) {
  await requireKv(env).delete(reportBlacklistKey(userId));
}
__name(deleteReportBlacklistEntry, "deleteReportBlacklistEntry");
async function getReportCooldown(env, userId) {
  const cooldown = await requireKv(env).get(reportCooldownKey(userId), "json");
  if (!cooldown || typeof cooldown !== "object") {
    return void 0;
  }
  const record = cooldown;
  const retryAt = Date.parse(record.retryAt);
  if (!Number.isFinite(retryAt) || retryAt <= Date.now()) {
    return void 0;
  }
  return record;
}
__name(getReportCooldown, "getReportCooldown");
async function putReportCooldown(env, userId, seconds) {
  const retryAt = new Date(Date.now() + seconds * 1e3).toISOString();
  await requireKv(env).put(reportCooldownKey(userId), JSON.stringify({ retryAt }), { expirationTtl: seconds });
  return { retryAt };
}
__name(putReportCooldown, "putReportCooldown");
async function getReporterReputation(env, userId) {
  if (!env.USER_PREFERENCES) {
    return emptyReporterReputation(userId);
  }
  const record = await env.USER_PREFERENCES.get(reporterReputationKey(userId), "json");
  if (record && typeof record === "object") {
    return normalizeReporterReputation(record);
  }
  return reporterReputationFromReports(userId, await listReports(env));
}
__name(getReporterReputation, "getReporterReputation");
async function putReporterReputation(env, record) {
  const normalized = normalizeReporterReputation({
    ...record,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await requireKv(env).put(reporterReputationKey(record.userId), JSON.stringify(normalized));
  return normalized;
}
__name(putReporterReputation, "putReporterReputation");
async function updateReporterReputation(env, userId, updates) {
  const existing = await getReporterReputation(env, userId);
  return putReporterReputation(env, {
    ...existing,
    ...updates
  });
}
__name(updateReporterReputation, "updateReporterReputation");
async function recordReportSubmitted(env, userId, submittedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const existing = await getReporterReputation(env, userId);
  return updateReporterReputation(env, userId, {
    submittedReports: existing.submittedReports + 1,
    lastReportAt: submittedAt
  });
}
__name(recordReportSubmitted, "recordReportSubmitted");
async function recordReportAccepted(env, userId, acceptedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const existing = await getReporterReputation(env, userId);
  return updateReporterReputation(env, userId, {
    acceptedReports: existing.acceptedReports + 1,
    lastAcceptedAt: acceptedAt
  });
}
__name(recordReportAccepted, "recordReportAccepted");
async function recordReportRejected(env, userId, rejectedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const existing = await getReporterReputation(env, userId);
  return updateReporterReputation(env, userId, {
    rejectedReports: existing.rejectedReports + 1,
    lastRejectedAt: rejectedAt
  });
}
__name(recordReportRejected, "recordReportRejected");
async function recordReportBanConfirmed(env, userId, confirmedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const existing = await getReporterReputation(env, userId);
  return updateReporterReputation(env, userId, {
    banConfirmedReports: existing.banConfirmedReports + 1,
    lastBanConfirmedAt: confirmedAt
  });
}
__name(recordReportBanConfirmed, "recordReportBanConfirmed");
async function suspiciousPatternForReport(env, targetPlayerId, reporterId) {
  if (!env.USER_PREFERENCES) {
    return void 0;
  }
  const reports = await listReports(env);
  const reporterIds = Array.from(
    /* @__PURE__ */ new Set([reporterId, ...reports.filter((report) => report.targetPlayerId === targetPlayerId).map((report) => report.reporterId)])
  );
  const reputations = await Promise.all(reporterIds.map((userId) => getReporterReputation(env, userId)));
  const trustedReporterCount = reputations.filter(reporterIsTrustedForSignals).length;
  if (trustedReporterCount < 2) {
    return void 0;
  }
  return {
    kind: "multiple_independent_reports",
    trustedReporterCount,
    reportCount: reports.filter((report) => report.targetPlayerId === targetPlayerId).length + 1,
    detectedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(suspiciousPatternForReport, "suspiciousPatternForReport");
async function getMonthlyCommunityRecap(env, month) {
  if (!env.USER_PREFERENCES) {
    return void 0;
  }
  const record = await env.USER_PREFERENCES.get(monthlyCommunityRecapKey(month), "json");
  return record && typeof record === "object" ? record : void 0;
}
__name(getMonthlyCommunityRecap, "getMonthlyCommunityRecap");
async function putMonthlyCommunityRecap(env, record) {
  await requireKv(env).put(monthlyCommunityRecapKey(record.month), JSON.stringify(record));
  return record;
}
__name(putMonthlyCommunityRecap, "putMonthlyCommunityRecap");

// src/lib/tracking.ts
var TRACKER_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1e3;
var MAX_TRACKERS_PER_CRON = 20;
function signed(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }
  if (value > 0) {
    return `+${formatInteger(value)}`;
  }
  return formatInteger(value);
}
__name(signed, "signed");
function movementScore(delta) {
  return Math.abs(delta.mmr || 0) * 5 + Math.abs(delta.kills || 0) + Math.abs(delta.deaths || 0) + Math.abs(delta.level || 0) * 10 + (delta.rankChanged ? 100 : 0);
}
__name(movementScore, "movementScore");
function isFresh(isoDate, now) {
  if (!isoDate) {
    return false;
  }
  const timestamp2 = Date.parse(isoDate);
  return Number.isFinite(timestamp2) && now.getTime() - timestamp2 < TRACKER_REFRESH_INTERVAL_MS;
}
__name(isFresh, "isFresh");
function trackingChanges(record) {
  return record.players.map((player) => {
    const latest = player.latestSnapshot || player.lastSnapshot;
    const baseline = player.baselineSnapshot || player.lastSnapshot;
    const delta = latest ? snapshotDelta(baseline, latest) : {
      kills: void 0,
      deaths: void 0,
      mmr: void 0,
      level: void 0,
      rankChanged: false
    };
    const score = movementScore(delta);
    return {
      player,
      baseline,
      latest,
      delta,
      changed: score > 0,
      movementScore: score
    };
  });
}
__name(trackingChanges, "trackingChanges");
function trackingChangeLines(change) {
  const latest = change.latest;
  if (!latest) {
    return ["No snapshot has been captured for this player yet."];
  }
  return [
    `Rank: **${latest.rank}**${change.delta.rankChanged && change.baseline?.rank ? ` from ${change.baseline.rank}` : ""}`,
    latest.peakRank ? `Peak: **${latest.peakRank}**` : void 0,
    latest.lastOnlineAt ? `Last online: **${formatLastOnlineValue(latest.lastOnlineAt)}**` : void 0,
    `MMR: **${formatOptionalInteger(latest.mmr)}** (${signed(change.delta.mmr)})`,
    `Kills: **${formatInteger(latest.kills)}** (${signed(change.delta.kills)})`,
    `Deaths: **${formatInteger(latest.deaths)}** (${signed(change.delta.deaths)})`,
    `Level: **${formatOptionalInteger(latest.level)}** (${signed(change.delta.level)})`
  ].filter((line) => Boolean(line));
}
__name(trackingChangeLines, "trackingChangeLines");
function acceptTrackerBaselines(record, now = /* @__PURE__ */ new Date()) {
  const viewedAt = now.toISOString();
  for (const player of record.players) {
    const latest = player.latestSnapshot || player.lastSnapshot;
    if (!latest) {
      continue;
    }
    player.baselineSnapshot = latest;
    player.lastViewedAt = viewedAt;
  }
  record.lastViewedAt = viewedAt;
  return record;
}
__name(acceptTrackerBaselines, "acceptTrackerBaselines");
async function refreshTrackerRecord(env, record, options = {}) {
  const now = options.now || /* @__PURE__ */ new Date();
  let refreshed = 0;
  for (const player of record.players) {
    if (!options.force && isFresh(player.lastRefreshedAt || player.latestSnapshot?.capturedAt, now)) {
      continue;
    }
    if (typeof options.maxPlayers === "number" && refreshed >= options.maxPlayers) {
      break;
    }
    try {
      const profile = await fetchProfileByPlayerOption(player.lookup);
      if (!profile) {
        continue;
      }
      const next = snapshotProfile(profile);
      player.latestSnapshot = next;
      player.lastSnapshot = next;
      player.lastRefreshedAt = next.capturedAt;
      player.label = displayName(profile);
      player.playerId = playerId(profile) || player.playerId;
      player.lookup = player.playerId || player.lookup;
      refreshed += 1;
    } catch (error) {
      console.error("Failed to refresh tracked player", {
        userId: record.userId,
        player: player.lookup,
        error
      });
    }
  }
  if (refreshed > 0) {
    record.lastRefreshedAt = now.toISOString();
  }
  return {
    record,
    refreshed
  };
}
__name(refreshTrackerRecord, "refreshTrackerRecord");
async function toggleTrackedProfile(env, userId, lookup) {
  const profile = await fetchProfileByPlayerOption(lookup);
  if (!profile) {
    return {
      ok: false,
      reason: "not_found"
    };
  }
  const record = await getTracker(env, userId);
  const tracked = trackedPlayerFromProfile(lookup, profile);
  const existing = record.players.findIndex((player) => player.key === tracked.key);
  const removed = existing >= 0;
  if (removed) {
    record.players.splice(existing, 1);
  } else {
    if (record.players.length >= 25) {
      return {
        ok: false,
        reason: "full"
      };
    }
    record.players.push(tracked);
  }
  await putTracker(env, record);
  return {
    ok: true,
    removed,
    profile,
    record
  };
}
__name(toggleTrackedProfile, "toggleTrackedProfile");
async function addTrackedProfile(env, userId, lookup) {
  const profile = await fetchProfileByPlayerOption(lookup);
  if (!profile) {
    return {
      ok: false,
      reason: "not_found"
    };
  }
  const record = await getTracker(env, userId);
  const tracked = trackedPlayerFromProfile(lookup, profile);
  const existing = record.players.findIndex((player) => player.key === tracked.key);
  if (existing >= 0) {
    record.players[existing] = {
      ...record.players[existing],
      label: tracked.label,
      lookup: tracked.lookup,
      playerId: tracked.playerId,
      latestSnapshot: tracked.latestSnapshot,
      lastSnapshot: tracked.lastSnapshot,
      lastRefreshedAt: tracked.lastRefreshedAt
    };
    await putTracker(env, record);
    return {
      ok: true,
      alreadyTracked: true,
      profile,
      record
    };
  }
  if (record.players.length >= 25) {
    return {
      ok: false,
      reason: "full"
    };
  }
  record.players.push(tracked);
  await putTracker(env, record);
  return {
    ok: true,
    alreadyTracked: false,
    profile,
    record
  };
}
__name(addTrackedProfile, "addTrackedProfile");
async function runScheduledRankedUpdates(env, now = /* @__PURE__ */ new Date()) {
  if (!env.USER_PREFERENCES) {
    return;
  }
  const trackers = await listTrackers(env);
  let checked = 0;
  for (const record of trackers) {
    if (checked >= MAX_TRACKERS_PER_CRON) {
      break;
    }
    if (record.players.length === 0 || isFresh(record.lastRefreshedAt, now)) {
      continue;
    }
    checked += 1;
    const refreshed = await refreshTrackerRecord(env, record, {
      now,
      maxPlayers: 10
    });
    if (refreshed.refreshed > 0) {
      await putTracker(env, refreshed.record);
    }
  }
}
__name(runScheduledRankedUpdates, "runScheduledRankedUpdates");

// src/lib/presentation.ts
var EMBED_IMAGES = {
  help: {
    url: "https://i.imgur.com/mo3ODsK.png",
    note: "Wide community banner: Patch logo, Critical Ops silhouettes, warm server-hub feel."
  },
  stats: {
    url: "https://i.imgur.com/GTjKeqK.png",
    note: "Player dashboard banner: clean stat panels, rank accent, readable dark UI."
  },
  clan: {
    url: "https://i.imgur.com/HXq1UZq.png",
    note: "Clan banner: team lineup or badge wall, leaderboard energy, not too busy."
  },
  compare: {
    url: "https://i.imgur.com/H32d4VT.png",
    note: "Versus banner: two profile panels facing each other with a subtle center split."
  },
  track: {
    url: "https://i.imgur.com/9UOgtlb.png",
    note: "Could be transparent. If visible, make it a calm tracking dashboard banner."
  },
  tags: {
    url: "https://i.imgur.com/riz1PbK.jpg",
    note: "Account tag guide banner: Patch status badges, friendly guide feel."
  },
  report: {
    url: "https://i.imgur.com/PqRb1Xi.png",
    note: "Could be transparent. If visible, make it a neutral staff-review banner."
  },
  transparent: {
    url: "https://i.imgur.com/GgOYRcb.png",
    note: "Replace with a truly transparent 1600x420 PNG when an embed should keep height without visible art."
  }
};
function embedImage(name) {
  return {
    url: EMBED_IMAGES[name].url
  };
}
__name(embedImage, "embedImage");
function quoteList(lines) {
  return lines.filter((line) => Boolean(line)).map((line) => `> - ${line}`).join("\n");
}
__name(quoteList, "quoteList");
function section(title, body) {
  return `**${title}**
${body}`;
}
__name(section, "section");
function pageFooter(page, pages, note) {
  return {
    text: note ? `Page ${page}/${pages} - ${note}` : `Page ${page}/${pages}`
  };
}
__name(pageFooter, "pageFooter");

// src/lib/components-v2.ts
var UI_ACCENT = EMBED_COLOR;
var UI_ACCENT_SUCCESS = 3066993;
var UI_ACCENT_WARNING = 16753735;
var UI_ACCENT_DANGER = 16726832;
var UI_ACCENT_MUTED = 9148067;
var CUSTOM_ID_PREFIX = "patch:v2";
function customId(...parts) {
  const sanitizedParts = parts.filter((part) => part !== void 0).map((part) => String(part).replace(/:/g, "_"));
  return [CUSTOM_ID_PREFIX, ...sanitizedParts].join(":").slice(0, 100);
}
__name(customId, "customId");
function parseCustomId(value) {
  const parts = (value || "").split(":");
  if (parts[0] === "patch" && parts[1] === "v2") {
    return {
      scope: parts[2],
      action: parts[3],
      args: parts.slice(4)
    };
  }
  if (parts[0] === "patch_v2") {
    return {
      scope: parts[1],
      action: parts[2],
      args: parts.slice(3)
    };
  }
  return void 0;
}
__name(parseCustomId, "parseCustomId");
function textDisplay(content) {
  return {
    type: COMPONENT_TEXT_DISPLAY,
    content: content.slice(0, 4e3)
  };
}
__name(textDisplay, "textDisplay");
function separator(divider = true, spacing = 1) {
  return {
    type: COMPONENT_SEPARATOR,
    divider,
    spacing
  };
}
__name(separator, "separator");
function mediaGallery(items) {
  return {
    type: COMPONENT_MEDIA_GALLERY,
    items: items.slice(0, 10).map((item) => ({
      media: {
        url: item.url
      },
      description: item.description,
      spoiler: item.spoiler
    }))
  };
}
__name(mediaGallery, "mediaGallery");
function sectionWithAccessory(components, accessory) {
  return {
    type: COMPONENT_SECTION,
    components: components.slice(0, 3),
    accessory
  };
}
__name(sectionWithAccessory, "sectionWithAccessory");
function container(components, options = {}) {
  return {
    type: COMPONENT_CONTAINER,
    accent_color: options.accentColor ?? UI_ACCENT,
    spoiler: options.spoiler,
    components: components.slice(0, 40)
  };
}
__name(container, "container");
function row(components) {
  return actionRow(components);
}
__name(row, "row");
function primaryButton(customIdValue, label, disabled = false) {
  return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}
__name(primaryButton, "primaryButton");
function secondaryButton(customIdValue, label, disabled = false) {
  return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}
__name(secondaryButton, "secondaryButton");
function successButton(customIdValue, label, disabled = false) {
  return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}
__name(successButton, "successButton");
function dangerButton(customIdValue, label, disabled = false) {
  return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}
__name(dangerButton, "dangerButton");
function selectMenu(customIdValue, placeholder, options) {
  return stringSelect(customIdValue, placeholder, options.slice(0, 25));
}
__name(selectMenu, "selectMenu");
function v2Message(components, flags = 0) {
  return {
    flags: flags | IS_COMPONENTS_V2,
    components,
    allowed_mentions: {
      parse: []
    }
  };
}
__name(v2Message, "v2Message");
function panel(title, body, options = {}) {
  const lines = body.filter((line) => Boolean(line));
  const children = [textDisplay(`### ${title}
${lines.join("\n")}`)];
  if (options.actions?.length) {
    children.push(separator(), ...options.actions);
  }
  return container(children, {
    accentColor: options.accentColor
  });
}
__name(panel, "panel");
function emptyStateContainer(title, message, actions = []) {
  return panel(title, [message], {
    accentColor: UI_ACCENT_WARNING,
    actions
  });
}
__name(emptyStateContainer, "emptyStateContainer");
function dashboardContainer(title, summary, sections, actions = []) {
  const children = [textDisplay(`## ${title}
${summary}`)];
  for (const section2 of sections) {
    const lines = section2.lines.filter((line) => Boolean(line));
    if (lines.length === 0) {
      continue;
    }
    children.push(separator(false), textDisplay(`**${section2.title}**
${lines.join("\n")}`));
  }
  if (actions.length > 0) {
    children.push(separator(), ...actions);
  }
  return container(children);
}
__name(dashboardContainer, "dashboardContainer");
function bulletList(lines) {
  return lines.filter((line) => Boolean(line)).map((line) => `- ${line}`).join("\n");
}
__name(bulletList, "bulletList");
function metricLine(label, value) {
  return `**${label}:** ${value ?? "N/A"}`;
}
__name(metricLine, "metricLine");

// src/lib/app-ui.ts
var PROFILE_VIEW_OPTIONS = [
  { label: "Overview", value: "overview", description: "Profile card and current read." },
  { label: "Ranked", value: "ranked", description: "Rank, MMR, and current season." },
  { label: "Clan", value: "clan", description: "Clan membership from player data." },
  { label: "History", value: "history", description: "Public season totals." },
  { label: "Actions", value: "actions", description: "Track, compare, and report shortcuts." }
];
var STATS_VIEW_OPTIONS = [
  { label: "Overview", value: "overview", description: "Identity, status, and rank." },
  { label: "Ranked", value: "ranked", description: "Current ranked shape." },
  { label: "Performance", value: "performance", description: "Mode-by-mode current season." },
  { label: "History", value: "history", description: "Public all-time totals." },
  { label: "Metadata", value: "metadata", description: "Account and public data notes." }
];
var HELP_SECTIONS = [
  { label: "Settings", value: "start", description: "Patch controls and defaults." },
  { label: "Private output", value: "privacy", description: "Keep supported replies ephemeral." },
  { label: "Tracking", value: "tracking", description: "Dashboard, changes, and removals." },
  { label: "Reports", value: "reporting", description: "Proof-backed staff review." },
  { label: "Compare", value: "compare", description: "Readable matchup boards." },
  { label: "Support", value: "about", description: "Server and app info." }
];
function profileKey(profile) {
  return playerId(profile) || encodeURIComponent(displayName(profile)).slice(0, 40);
}
__name(profileKey, "profileKey");
function timestamp(isoDate, style = "R") {
  const value = isoDate ? Date.parse(isoDate) : NaN;
  if (!Number.isFinite(value)) {
    return "Never";
  }
  return `<t:${Math.floor(value / 1e3)}:${style}>`;
}
__name(timestamp, "timestamp");
function latestSeasonNumber(profile) {
  return currentSeason(profile.stats?.seasonal_stats || []);
}
__name(latestSeasonNumber, "latestSeasonNumber");
function profileActions(profile) {
  const key = profileKey(profile);
  return [
    row([
      primaryButton(customId("profile", "stats", key), "Stats"),
      successButton(customId("profile", "track", key), "Track"),
      secondaryButton(customId("profile", "compare", key), "Compare"),
      dangerButton(customId("profile", "report", key), "Report"),
      secondaryButton(customId("profile", "refresh", key), "Refresh")
    ])
  ];
}
__name(profileActions, "profileActions");
function playerNavigation(profile, selected, source) {
  return row([
    selectMenu(
      customId(source, "view", profileKey(profile)),
      source === "profile" ? "Profile sections" : "Stats sections",
      (source === "profile" ? PROFILE_VIEW_OPTIONS : STATS_VIEW_OPTIONS).map((option) => ({
        ...option,
        default: option.value === selected
      }))
    )
  ]);
}
__name(playerNavigation, "playerNavigation");
function statusLine(report, tagRecord) {
  if (report) {
    return `Community report accepted: **${report.reason}**`;
  }
  if (tagRecord?.tags.length) {
    return `Curated tags: **${tagRecord.tags.join(", ")}**`;
  }
  return "Community status: **Secure**";
}
__name(statusLine, "statusLine");
function peakRankMetric(profile) {
  return peakRankName(profile.stats?.ranked) || "Unknown";
}
__name(peakRankMetric, "peakRankMetric");
function profileCardAttachmentMessage(options) {
  return {
    allowed_mentions: {
      parse: []
    }
  };
}
__name(profileCardAttachmentMessage, "profileCardAttachmentMessage");
function profileCardContainerMessage(options) {
  return v2Message([
    container([
      mediaGallery([
        {
          url: options.attachmentUrl,
          description: `${displayName(options.profile)} profile card`
        }
      ]),
      separator(false),
      ...profileActions(options.profile)
    ])
  ]);
}
__name(profileCardContainerMessage, "profileCardContainerMessage");
function statsDashboardMessage(options) {
  const { profile, report, tagRecord } = options;
  const view = options.view || "overview";
  const key = profileKey(profile);
  const seasonNumber = latestSeasonNumber(profile);
  const season = seasonByNumber(profile.stats?.seasonal_stats || [], seasonNumber);
  const ranked = profile.stats?.ranked;
  const lastOnline = formatLastOnline(profile);
  const children = [
    textDisplay(
      [
        `## ${displayName(profile)} stats`,
        `${statusLine(report, tagRecord)}`,
        bulletList([
          metricLine("Player ID", playerId(profile) ? `\`${playerId(profile)}\`` : "Unknown"),
          lastOnline ? metricLine("Last online", lastOnline) : void 0,
          metricLine("Selected view", view),
          metricLine("Season", seasonNumber ?? "Unknown")
        ])
      ].join("\n")
    )
  ];
  if (view === "overview") {
    children.push(
      separator(),
      textDisplay(
        [
          "**Overview**",
          bulletList([
            metricLine("Rank", rankName(ranked)),
            metricLine("Peak", peakRankMetric(profile)),
            metricLine("MMR", formatOptionalInteger(ranked?.mmr)),
            metricLine("Clan", formatClanMembership(profile).replace(/\n/g, " - ")),
            accountCreatedEstimate(profile.stats?.seasonal_stats || [])
          ])
        ].join("\n")
      )
    );
  }
  if (view === "ranked") {
    children.push(
      separator(),
      textDisplay(`**Ranked**
${bulletList([...formatRank(ranked).split("\n"), ...formatStats(season?.ranked).split("\n")])}`)
    );
  }
  if (view === "performance") {
    children.push(
      separator(),
      textDisplay(
        [
          "**Performance**",
          bulletList([
            `Ranked: ${fieldValue(statField("Ranked", season?.ranked).value)}`,
            `Casual: ${fieldValue(statField("Casual", season?.casual).value)}`,
            `Custom: ${fieldValue(statField("Custom", season?.custom).value)}`
          ])
        ].join("\n")
      )
    );
  }
  if (view === "history") {
    children.push(
      separator(),
      textDisplay(
        [
          "**Historical public totals**",
          bulletList([
            `Ranked: ${fieldValue(statField("Ranked", sumStats(profile.stats?.seasonal_stats || [], "ranked")).value)}`,
            `Casual: ${fieldValue(statField("Casual", sumStats(profile.stats?.seasonal_stats || [], "casual")).value)}`,
            `Custom: ${fieldValue(statField("Custom", sumStats(profile.stats?.seasonal_stats || [], "custom")).value)}`
          ])
        ].join("\n")
      )
    );
  }
  if (view === "metadata") {
    children.push(
      separator(),
      textDisplay(
        [
          "**Metadata**",
          bulletList([
            ...formatBan(profile.ban).split("\n"),
            `Profile data source: Critical Ops public profile API`,
            `Snapshot generated: <t:${Math.floor(Date.now() / 1e3)}:R>`
          ])
        ].join("\n")
      )
    );
  }
  children.push(
    separator(),
    playerNavigation(profile, view, "stats"),
    row([
      primaryButton(customId("stats", "profile", key), "View Profile"),
      secondaryButton(customId("stats", "compare", key), "Compare"),
      successButton(customId("stats", "track", key), "Track"),
      dangerButton(customId("stats", "report", key), "Report")
    ])
  );
  return v2Message([
    container(children, {
      accentColor: report ? UI_ACCENT_DANGER : UI_ACCENT
    })
  ]);
}
__name(statsDashboardMessage, "statsDashboardMessage");
function compareMessage(playerA, playerB) {
  const aName = displayName(playerA);
  const bName = displayName(playerB);
  const aRanked = latestSeason(playerA)?.ranked;
  const bRanked = latestSeason(playerB)?.ranked;
  const keyA = profileKey(playerA);
  const keyB = profileKey(playerB);
  const aLastOnline = formatLastOnline(playerA);
  const bLastOnline = formatLastOnline(playerB);
  return v2Message([
    container([
      textDisplay(
        [
          `## ${aName} vs ${bName}`,
          "Current-season comparison from public ranked data.",
          bulletList([
            `${aName}: **${rankName(playerA.stats?.ranked)}**, ${formatOptionalInteger(playerA.stats?.ranked?.mmr)} MMR`,
            aLastOnline ? `${aName} last online: ${aLastOnline}` : void 0,
            `${aName} peak: **${peakRankMetric(playerA)}**`,
            `${bName}: **${rankName(playerB.stats?.ranked)}**, ${formatOptionalInteger(playerB.stats?.ranked?.mmr)} MMR`,
            bLastOnline ? `${bName} last online: ${bLastOnline}` : void 0,
            `${bName} peak: **${peakRankMetric(playerB)}**`
          ])
        ].join("\n")
      ),
      separator(),
      textDisplay(`**${aName} ranked**
${bulletList(formatStats(aRanked).split("\n"))}`),
      textDisplay(`**${bName} ranked**
${bulletList(formatStats(bRanked).split("\n"))}`),
      separator(),
      row([
        primaryButton(customId("stats", "profile", keyA), `${aName.slice(0, 24)} profile`),
        primaryButton(customId("stats", "profile", keyB), `${bName.slice(0, 24)} profile`),
        secondaryButton(customId("profile", "compare", keyA), "New Compare")
      ])
    ])
  ]);
}
__name(compareMessage, "compareMessage");
function trackingDashboardMessage(options) {
  const { record } = options;
  const filter = options.filter || "all";
  const ephemeral = options.ephemeral ?? true;
  const changes = options.changes.filter((change) => filter === "all" || change.changed).sort((a, b) => b.movementScore - a.movementScore || a.player.label.localeCompare(b.player.label));
  const changedCount = options.changes.filter((change) => change.changed).length;
  if (record.players.length === 0) {
    return v2Message(
      [
        emptyStateContainer(
          "Tracking dashboard",
          "No tracked players yet. Add a player with `/track player:<name-or-id>` or from a profile hub.",
          [row([primaryButton(customId("track", "add"), "Add Player")])]
        )
      ],
      ephemeral ? 64 : 0
    );
  }
  const playerSections = changes.slice(0, 25).map(
    (change) => sectionWithAccessory(
      [textDisplay([`**${change.player.label}**`, bulletList(trackingChangeLines(change))].join("\n"))],
      dangerButton(customId("track", "remove", change.player.key), "Remove")
    )
  );
  return v2Message(
    [
      container(
        [
          textDisplay(
            [
              "## Tracking dashboard",
              "Every tracked player is listed with changes since your last check.",
              bulletList([
                metricLine("Tracked players", record.players.length),
                metricLine("Players with changes", changedCount),
                metricLine("Last refresh", timestamp(record.lastRefreshedAt)),
                metricLine("Last check", timestamp(record.lastViewedAt))
              ])
            ].join("\n")
          ),
          separator(),
          ...playerSections.length > 0 ? playerSections : [textDisplay("**No changes since your last check**\nRefresh later, or add another player to the dashboard.")],
          separator(false),
          row([
            primaryButton(customId("track", "refresh"), "Refresh all"),
            secondaryButton(customId("track", "add"), "Add player"),
            secondaryButton(customId("track", "public"), "Show publicly")
          ])
        ],
        {
          accentColor: changedCount > 0 ? UI_ACCENT_WARNING : UI_ACCENT_SUCCESS
        }
      )
    ],
    ephemeral ? 64 : 0
  );
}
__name(trackingDashboardMessage, "trackingDashboardMessage");
function helpDashboardMessage(options) {
  const section2 = options.section || "start";
  const support = supportServerUrl(options.env);
  const sections = {
    start: {
      title: "Patch dashboard",
      summary: "Choose how Patch replies, open player tools, and manage your Critical Ops tracking list.",
      lines: [
        "`/profile` posts the clean player card.",
        "`/stats` opens the dashboard with profile, compare, track, and report controls.",
        "`/track player:<name-or-id>` adds a player and returns your tracking dashboard."
      ]
    },
    privacy: {
      title: "Private output",
      summary: "Supported commands have an optional `private:true` flag for an ephemeral response.",
      lines: [
        "Available on `/profile`, `/stats`, `/help`, and `/compare`.",
        "`/track` opens privately and includes a Show publicly button.",
        "Reports use private forms and direct messages for reporter updates.",
        "Leave `private` empty when you want the server to see the result."
      ]
    },
    tracking: {
      title: "Tracking",
      summary: "`/track` opens your player watchlist and compares players against your last check.",
      lines: [
        "Add with `/track player:<name-or-id>` or the Add player button.",
        "Remove a player with the button beside their IGN.",
        "Refresh all updates the dashboard and prepares the next comparison point."
      ]
    },
    reporting: {
      title: "Reporting",
      summary: "`/report` sends proof and context to staff review.",
      lines: [
        "Use image or video proof with the slash command.",
        "Use Report from player actions when you already have a profile open.",
        "Reporter DMs include the report banner and the staff decision."
      ]
    },
    compare: {
      title: "Compare",
      summary: "`/compare` builds a scannable matchup board for two players.",
      lines: [
        "The board highlights rank, MMR, peak rank, last online, and current ranked stats.",
        "Use the profile buttons below the comparison to open either player card."
      ]
    },
    about: {
      title: "Support and about",
      summary: `Support server: ${support}`,
      lines: [
        "Patch is a Critical Ops Discord app for player cards, stats, tracking, comparisons, and reports.",
        "Use the support server for questions, staff review, and setup help."
      ]
    }
  };
  const selectedKey = sections[section2] ? section2 : "start";
  const selected = sections[selectedKey];
  const actions = [
    row([
      selectMenu(
        customId("help", "section"),
        "Help sections",
        HELP_SECTIONS.map((option) => ({
          ...option,
          default: option.value === selectedKey
        }))
      )
    ])
  ];
  return v2Message([
    dashboardContainer(
      selected.title,
      selected.summary,
      [
        {
          title: "Details",
          lines: selected.lines
        }
      ],
      actions
    )
  ]);
}
__name(helpDashboardMessage, "helpDashboardMessage");
function reportDmImageUrl(env) {
  return env.REPORT_DM_IMAGE_URL?.trim() || embedImage("report").url;
}
__name(reportDmImageUrl, "reportDmImageUrl");
function reportDmEmbed(options) {
  const description = options.lines.filter((line) => Boolean(line)).map((line) => `\u2022 ${line}`).join("\n");
  return {
    embeds: [
      {
        title: options.title,
        description,
        color: options.color,
        image: {
          url: reportDmImageUrl(options.env)
        },
        timestamp: options.timestamp || (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    allowed_mentions: {
      parse: []
    }
  };
}
__name(reportDmEmbed, "reportDmEmbed");
function proofStatus(proof) {
  if (!proof?.url) {
    return "No proof attached";
  }
  if (proof.contentType?.startsWith("video/")) {
    return "Video proof attached";
  }
  if (proof.contentType?.startsWith("image/")) {
    return "Image proof attached";
  }
  return "Evidence link attached";
}
__name(proofStatus, "proofStatus");
function declineGuidance(reason) {
  const normalized = (reason || "").toLowerCase();
  if (normalized.includes("not enough evidence")) {
    return "No bad vibes. Keep sending clean proof when something feels off; good reports still help the team move faster.";
  }
  if (normalized.includes("wrong player")) {
    return "Double-check the player ID or profile before sending. You can use `/stats` to verify you have the right person.";
  }
  if (normalized.includes("clip too short")) {
    return "Longer clips help staff see the full picture \u2014 setup, action, and aftermath. Aim for at least 15\u201330 seconds of context around the incident.";
  }
  if (normalized.includes("already handled")) {
    return "Staff already had this one covered \u2014 no extra action was needed from your side. Your vigilance is still appreciated.";
  }
  return "No bad vibes. Keep sending clean proof when something feels off; good reports still help the team move faster.";
}
__name(declineGuidance, "declineGuidance");
function reportReceiptSubmitted(options) {
  const { report } = options;
  return reportDmEmbed({
    env: options.env,
    title: "Report received.",
    lines: [
      `Your report on **${report.targetName}** is now in the staff queue.`,
      `${proofStatus(report.proof)}.`,
      `You'll get a DM when staff reach a decision.`
    ],
    color: UI_ACCENT,
    timestamp: report.createdAt
  });
}
__name(reportReceiptSubmitted, "reportReceiptSubmitted");
function reportReceiptAccepted(options) {
  const { report } = options;
  return reportDmEmbed({
    env: options.env,
    title: "Report accepted. Good eye.",
    lines: [
      `Your report on **${report.targetName}** checked out.`,
      report.publicReason ? `Staff marked it as **${report.publicReason}**.` : void 0
    ],
    color: UI_ACCENT_SUCCESS,
    timestamp: report.reviewedAt || report.createdAt
  });
}
__name(reportReceiptAccepted, "reportReceiptAccepted");
function reportReceiptRejected(options) {
  const { report } = options;
  return reportDmEmbed({
    env: options.env,
    title: "Report reviewed. No action this time.",
    lines: [
      `Staff looked at your report on **${report.targetName}**.`,
      report.publicReason ? `Decision: **${report.publicReason}**.` : void 0,
      declineGuidance(report.publicReason)
    ],
    color: UI_ACCENT_MUTED,
    timestamp: report.reviewedAt || report.createdAt
  });
}
__name(reportReceiptRejected, "reportReceiptRejected");
function reportReceiptBanConfirmed(options) {
  const { report } = options;
  return reportDmEmbed({
    env: options.env,
    title: "Bullseye. They got banned.",
    lines: [
      `The player you reported, **${report.targetName}**, is now banned in-game.`,
      report.publicReason ? `Your accepted report: **${report.publicReason}**.` : void 0
    ],
    color: UI_ACCENT_WARNING,
    timestamp: report.banConfirmedAt || report.reviewedAt || report.createdAt
  });
}
__name(reportReceiptBanConfirmed, "reportReceiptBanConfirmed");
function reportReceiptMessage(options) {
  const { report } = options;
  if (report.status === "ban_confirmed") {
    return reportReceiptBanConfirmed(options);
  }
  if (report.status === "accepted") {
    return reportReceiptAccepted(options);
  }
  if (report.status === "rejected") {
    return reportReceiptRejected(options);
  }
  return reportReceiptSubmitted(options);
}
__name(reportReceiptMessage, "reportReceiptMessage");
function communityRecapMessage(recap) {
  const movementLines = recap.topRankMovements.length ? recap.topRankMovements.map(
    (movement) => `${movement.playerName}: **+${movement.mmrDelta || 0} MMR**${movement.rank ? `, ${movement.rank}` : ""}`
  ) : ["No positive tracked rank movement in the baseline yet."];
  return v2Message([
    container(
      [
        textDisplay(
          [
            `## Community recap: ${recap.month}`,
            "No personal shaming; this is a high-level moderation and movement summary.",
            bulletList([
              metricLine("Reports reviewed", recap.reportsReviewed),
              metricLine("Accepted", recap.reportsAccepted),
              metricLine("Declined", recap.reportsDeclined),
              metricLine("Bans confirmed", recap.bansConfirmed)
            ])
          ].join("\n")
        ),
        separator(false),
        textDisplay(`**Top tracked rank movements**
${bulletList(movementLines)}`)
      ],
      {
        accentColor: UI_ACCENT_SUCCESS
      }
    )
  ]);
}
__name(communityRecapMessage, "communityRecapMessage");
function devDashboardMessage(message, ok = true) {
  return v2Message(
    [
      container([textDisplay(`## Developer tools
${message}`)], {
        accentColor: ok ? UI_ACCENT_SUCCESS : UI_ACCENT_DANGER
      })
    ],
    64
  );
}
__name(devDashboardMessage, "devDashboardMessage");
function simpleErrorMessage(title, message, ephemeral = true) {
  return v2Message(
    [
      container([textDisplay(`## ${title}
${message}`)], {
        accentColor: UI_ACCENT_DANGER
      })
    ],
    ephemeral ? 64 : 0
  );
}
__name(simpleErrorMessage, "simpleErrorMessage");

// src/lib/card-image.ts
import monoRegular from "./898ddb2e35ec8bc699c86d0a5e26da10a32a2600-JetBrainsMono_400Regular.ttf";
import monoBold from "./a2ca1bc6bb575ac125d9eaf338aa9a5af56bc377-JetBrainsMono_700Bold.ttf";

// node_modules/@resvg/resvg-wasm/index.mjs
var wasm;
var heap = new Array(128).fill(void 0);
heap.push(void 0, null, true, false);
var heap_next = heap.length;
function addHeapObject(obj) {
  if (heap_next === heap.length)
    heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
__name(addHeapObject, "addHeapObject");
function getObject(idx) {
  return heap[idx];
}
__name(getObject, "getObject");
function dropObject(idx) {
  if (idx < 132)
    return;
  heap[idx] = heap_next;
  heap_next = idx;
}
__name(dropObject, "dropObject");
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
__name(takeObject, "takeObject");
var WASM_VECTOR_LEN = 0;
var cachedUint8Memory0 = null;
function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}
__name(getUint8Memory0, "getUint8Memory0");
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: /* @__PURE__ */ __name(() => {
  throw Error("TextEncoder not available");
}, "encode") };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8Memory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
__name(passStringToWasm0, "passStringToWasm0");
function isLikeNone(x) {
  return x === void 0 || x === null;
}
__name(isLikeNone, "isLikeNone");
var cachedInt32Memory0 = null;
function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}
__name(getInt32Memory0, "getInt32Memory0");
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: /* @__PURE__ */ __name(() => {
  throw Error("TextDecoder not available");
}, "decode") };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
__name(getStringFromWasm0, "getStringFromWasm0");
function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}
__name(_assertClass, "_assertClass");
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
__name(handleError, "handleError");
var BBoxFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_bbox_free(ptr >>> 0));
var BBox = class _BBox {
  static {
    __name(this, "_BBox");
  }
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_BBox.prototype);
    obj.__wbg_ptr = ptr;
    BBoxFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BBoxFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_bbox_free(ptr);
  }
  /**
  * @returns {number}
  */
  get x() {
    const ret = wasm.__wbg_get_bbox_x(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set x(arg0) {
    wasm.__wbg_set_bbox_x(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get y() {
    const ret = wasm.__wbg_get_bbox_y(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set y(arg0) {
    wasm.__wbg_set_bbox_y(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get width() {
    const ret = wasm.__wbg_get_bbox_width(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set width(arg0) {
    wasm.__wbg_set_bbox_width(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get height() {
    const ret = wasm.__wbg_get_bbox_height(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set height(arg0) {
    wasm.__wbg_set_bbox_height(this.__wbg_ptr, arg0);
  }
};
var RenderedImageFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_renderedimage_free(ptr >>> 0));
var RenderedImage = class _RenderedImage {
  static {
    __name(this, "_RenderedImage");
  }
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_RenderedImage.prototype);
    obj.__wbg_ptr = ptr;
    RenderedImageFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    RenderedImageFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_renderedimage_free(ptr);
  }
  /**
  * Get the PNG width
  * @returns {number}
  */
  get width() {
    const ret = wasm.renderedimage_width(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
  * Get the PNG height
  * @returns {number}
  */
  get height() {
    const ret = wasm.renderedimage_height(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
  * Write the image data to Uint8Array
  * @returns {Uint8Array}
  */
  asPng() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.renderedimage_asPng(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Get the RGBA pixels of the image
  * @returns {Uint8Array}
  */
  get pixels() {
    const ret = wasm.renderedimage_pixels(this.__wbg_ptr);
    return takeObject(ret);
  }
};
var ResvgFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_resvg_free(ptr >>> 0));
var Resvg = class {
  static {
    __name(this, "Resvg");
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ResvgFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_resvg_free(ptr);
  }
  /**
  * @param {Uint8Array | string} svg
  * @param {string | undefined} [options]
  * @param {Array<any> | undefined} [custom_font_buffers]
  */
  constructor(svg, options, custom_font_buffers) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.resvg_new(retptr, addHeapObject(svg), ptr0, len0, isLikeNone(custom_font_buffers) ? 0 : addHeapObject(custom_font_buffers));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Get the SVG width
  * @returns {number}
  */
  get width() {
    const ret = wasm.resvg_width(this.__wbg_ptr);
    return ret;
  }
  /**
  * Get the SVG height
  * @returns {number}
  */
  get height() {
    const ret = wasm.resvg_height(this.__wbg_ptr);
    return ret;
  }
  /**
  * Renders an SVG in Wasm
  * @returns {RenderedImage}
  */
  render() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_render(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return RenderedImage.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Output usvg-simplified SVG string
  * @returns {string}
  */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
  * Calculate a maximum bounding box of all visible elements in this SVG.
  *
  * Note: path bounding box are approx values.
  * @returns {BBox | undefined}
  */
  innerBBox() {
    const ret = wasm.resvg_innerBBox(this.__wbg_ptr);
    return ret === 0 ? void 0 : BBox.__wrap(ret);
  }
  /**
  * Calculate a maximum bounding box of all visible elements in this SVG.
  * This will first apply transform.
  * Similar to `SVGGraphicsElement.getBBox()` DOM API.
  * @returns {BBox | undefined}
  */
  getBBox() {
    const ret = wasm.resvg_getBBox(this.__wbg_ptr);
    return ret === 0 ? void 0 : BBox.__wrap(ret);
  }
  /**
  * Use a given `BBox` to crop the svg. Currently this method simply changes
  * the viewbox/size of the svg and do not move the elements for simplicity
  * @param {BBox} bbox
  */
  cropByBBox(bbox) {
    _assertClass(bbox, BBox);
    wasm.resvg_cropByBBox(this.__wbg_ptr, bbox.__wbg_ptr);
  }
  /**
  * @returns {Array<any>}
  */
  imagesToResolve() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_imagesToResolve(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {string} href
  * @param {Uint8Array} buffer
  */
  resolveImage(href, buffer) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(href, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.resvg_resolveImage(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(buffer));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
};
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
__name(__wbg_load, "__wbg_load");
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_new_28c511d9baebfa89 = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_values_839f3396d5aac002 = function(arg0) {
    const ret = getObject(arg0).values();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_196c84450b364254 = function() {
    return handleError(function(arg0) {
      const ret = getObject(arg0).next();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_done_298b57d23c0fc80c = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
  };
  imports.wbg.__wbg_value_d93c65011f51a456 = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : void 0;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() {
    const ret = new Array();
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_push_a5b05aedc7234f9f = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbg_length_c20a40f15020d68a = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  return imports;
}
__name(__wbg_get_imports, "__wbg_get_imports");
function __wbg_init_memory(imports, maybe_memory) {
}
__name(__wbg_init_memory, "__wbg_init_memory");
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
}
__name(__wbg_finalize_init, "__wbg_finalize_init");
async function __wbg_init(input) {
  if (wasm !== void 0)
    return wasm;
  if (typeof input === "undefined") {
    input = new URL("index_bg.wasm", void 0);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module);
}
__name(__wbg_init, "__wbg_init");
var dist_default = __wbg_init;
var initialized = false;
var initWasm = /* @__PURE__ */ __name(async (module_or_path) => {
  if (initialized) {
    throw new Error("Already initialized. The `initWasm()` function can be used only once.");
  }
  await dist_default(await module_or_path);
  initialized = true;
}, "initWasm");
var Resvg2 = class extends Resvg {
  static {
    __name(this, "Resvg2");
  }
  /**
   * @param {Uint8Array | string} svg
   * @param {ResvgRenderOptions | undefined} options
   */
  constructor(svg, options) {
    if (!initialized)
      throw new Error("Wasm has not been initialized. Call `initWasm()` function.");
    const font = options?.font;
    if (!!font && isCustomFontsOptions(font)) {
      const serializableOptions = {
        ...options,
        font: {
          ...font,
          fontBuffers: void 0
        }
      };
      super(svg, JSON.stringify(serializableOptions), font.fontBuffers);
    } else {
      super(svg, JSON.stringify(options));
    }
  }
};
function isCustomFontsOptions(value) {
  return Object.prototype.hasOwnProperty.call(value, "fontBuffers");
}
__name(isCustomFontsOptions, "isCustomFontsOptions");

// src/lib/card-image.ts
import resvgWasm from "./dd4dd8881e2df4e64203b5c0ae65e1648ab55207-index_bg.wasm";
import rank0Icon from "./87ce93d7c6569fb60362e2b7c3114a510d4cb16d-rank-0-unranked.png";
import rank1Icon from "./41355f3604a3daba9106c6165ab220c8102a9e70-rank-1-bronze.png";
import rank2Icon from "./88f4ffbf3531d1c426e945904ce9f1bf748490c6-rank-2-silver.png";
import rank3Icon from "./11763279f334e6ec6b6745ff691853ebf98064ff-rank-3-gold.png";
import rank4Icon from "./21a81157be823478cb2c99a2d1e25e551a43ef05-rank-4-platinum.png";
import rank5Icon from "./121350ab2849a7465e017b3b3b29fe05b72023b4-rank-5-diamond.png";
import rank6Icon from "./d04c49cb88ac6b90516f6a14900745fea69f3544-rank-6-master.png";
import rank7Icon from "./c8be7122d1c00aceeea20336413059c23ee88244-rank-7-specops.png";
import rank8Icon from "./0637d67230ac8e14b622979fa4c43b677c0a18cb-rank-8-elite.png";
var CARD_WIDTH = 1410;
var CARD_HEIGHT = 936;
var CARD_OUTPUT_WIDTH = 1200;
var FONT_BUFFERS = [new Uint8Array(monoRegular), new Uint8Array(monoBold)];
var FONT_FAMILY = "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
var DOT = "\xB7";
var STATUS_RIGHT_X = 1336;
var STATUS_ICON_SIZE = 26;
var STATUS_ICON_GAP = 10;
var STATUS_ICON_Y = 835;
var resvgInitPromise;
var resvgWarmupPromise;
var ICONS = {
  // Lucide icon path data, ISC license. Kept inline so the Worker never reads files at runtime.
  ban: ['<circle cx="12" cy="12" r="10" />', '<path d="m4.9 4.9 14.2 14.2" />'],
  crosshair: [
    '<circle cx="12" cy="12" r="10" />',
    '<line x1="22" x2="18" y1="12" y2="12" />',
    '<line x1="6" x2="2" y1="12" y2="12" />',
    '<line x1="12" x2="12" y1="6" y2="2" />',
    '<line x1="12" x2="12" y1="22" y2="18" />'
  ],
  trophy: [
    '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />',
    '<path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />',
    '<path d="M18 9h1.5a1 1 0 0 0 0-5H18" />',
    '<path d="M4 22h16" />',
    '<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />',
    '<path d="M6 9H4.5a1 1 0 0 1 0-5H6" />'
  ],
  gem: [
    '<path d="M10.5 3 8 9l4 13 4-13-2.5-6" />',
    '<path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />',
    '<path d="M2 9h20" />'
  ],
  eye: [
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />',
    '<circle cx="12" cy="12" r="3" />'
  ],
  "chevrons-up": ['<path d="m17 11-5-5-5 5" />', '<path d="m17 18-5-5-5 5" />'],
  "shield-alert": [
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />',
    '<path d="M12 8v4" />',
    '<path d="M12 16h.01" />'
  ],
  "shield-check": [
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />',
    '<path d="m9 12 2 2 4-4" />'
  ],
  "badge-check": [
    '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />',
    '<path d="m9 12 2 2 4-4" />'
  ],
  handshake: [
    '<path d="m11 17 2 2a1 1 0 1 0 3-3" />',
    '<path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />',
    '<path d="m21 3 1 11h-2" />',
    '<path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />',
    '<path d="M3 4h8" />'
  ],
  "code-2": ['<path d="m18 16 4-4-4-4" />', '<path d="m6 8-4 4 4 4" />', '<path d="m14.5 4-5 16" />'],
  clapperboard: [
    '<path d="m12.296 3.464 3.02 3.956" />',
    '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" />',
    '<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
    '<path d="m6.18 5.276 3.1 3.899" />'
  ],
  swords: [
    '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />',
    '<line x1="13" x2="19" y1="19" y2="13" />',
    '<line x1="16" x2="20" y1="16" y2="20" />',
    '<line x1="19" x2="21" y1="21" y2="19" />',
    '<polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />',
    '<line x1="5" x2="9" y1="14" y2="18" />',
    '<line x1="7" x2="4" y1="17" y2="20" />',
    '<line x1="3" x2="5" y1="19" y2="21" />'
  ],
  "calendar-days": [
    '<path d="M8 2v4" />',
    '<path d="M16 2v4" />',
    '<rect width="18" height="18" x="3" y="4" rx="2" />',
    '<path d="M3 10h18" />',
    '<path d="M8 14h.01" />',
    '<path d="M12 14h.01" />',
    '<path d="M16 14h.01" />',
    '<path d="M8 18h.01" />',
    '<path d="M12 18h.01" />',
    '<path d="M16 18h.01" />'
  ]
};
var RANK_ICON_DATA_URIS = [rank0Icon, rank1Icon, rank2Icon, rank3Icon, rank4Icon, rank5Icon, rank6Icon, rank7Icon, rank8Icon].map(
  pngDataUri
);
var WARMUP_PROFILE = {
  basicInfo: {
    userID: 0,
    name: "Warmup",
    playerLevel: {
      level: 88
    }
  },
  clan: {
    basicInfo: {
      name: "Patch",
      tag: "BOT"
    },
    memberRank: 40
  },
  stats: {
    seasonal_stats: [
      {
        season: 17,
        ranked: {
          k: 20,
          d: 10,
          a: 5,
          w: 4,
          l: 2
        }
      }
    ],
    ranked: {
      placement_matches_left: 0,
      wins: 4,
      losses: 2,
      mmr: 1661,
      rank: 6
    }
  }
};
function escapeXml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(escapeXml, "escapeXml");
function truncate(value, maxLength) {
  return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 1))}.` : value;
}
__name(truncate, "truncate");
function formatRawId(value) {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.trunc(value)) : "UNKNOWN";
}
__name(formatRawId, "formatRawId");
function compactPercent(value) {
  return value.replace(".0%", "%");
}
__name(compactPercent, "compactPercent");
function compactDecimal(value) {
  return value.toFixed(1).replace(/\.0$/, "");
}
__name(compactDecimal, "compactDecimal");
function formatLookupCountLabel(value) {
  const count = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  if (count >= 1e6) {
    return `${compactDecimal(Math.floor(count / 1e5) / 10)}M`;
  }
  if (count >= 1e4) {
    return `${Math.floor(count / 1e3)}K`;
  }
  if (count >= 1e3) {
    return `${compactDecimal(Math.floor(count / 100) / 10)}K`;
  }
  if (count >= 100) {
    return `${Math.floor(count / 100) * 100}+`;
  }
  return String(count);
}
__name(formatLookupCountLabel, "formatLookupCountLabel");
function pngDataUri(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return `data:image/png;base64,${btoa(binary)}`;
}
__name(pngDataUri, "pngDataUri");
function rankIconIndex(rank) {
  if (/elite/i.test(rank)) return 8;
  if (/spec/i.test(rank)) return 7;
  if (/master/i.test(rank)) return 6;
  if (/diamond/i.test(rank)) return 5;
  if (/platinum/i.test(rank)) return 4;
  if (/gold/i.test(rank)) return 3;
  if (/silver/i.test(rank)) return 2;
  if (/bronze/i.test(rank)) return 1;
  return 0;
}
__name(rankIconIndex, "rankIconIndex");
function rankIcon(rank, x, y) {
  const iconIndex = rankIconIndex(rank);
  const iconUri = RANK_ICON_DATA_URIS[iconIndex] || RANK_ICON_DATA_URIS[0];
  const slotSize = 128;
  const iconSize = 104;
  const iconX = x + (slotSize - iconSize) / 2;
  const iconY = y + (slotSize - iconSize) / 2;
  return [
    `<g data-card-rank-icon="${escapeXml(rank)}">`,
    `<image x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" href="${iconUri}" preserveAspectRatio="xMidYMid meet" />`,
    `</g>`
  ].join("");
}
__name(rankIcon, "rankIcon");
function topMetadataLine() {
  return Math.random() < 0.5 ? `SUPPORT ${DOT} ${supportServerLabel()}` : DEVELOPER_CREDIT;
}
__name(topMetadataLine, "topMetadataLine");
function text(value, x, y, options = {}) {
  const label = options.maxLength ? truncate(value, options.maxLength) : value;
  const spacing = typeof options.spacing === "number" ? options.spacing : 0;
  const stroke = options.stroke ? ` stroke="${options.stroke}" stroke-width="${options.strokeWidth || 0}" paint-order="stroke" stroke-linejoin="round"` : "";
  const opacity = typeof options.opacity === "number" ? ` opacity="${options.opacity}"` : "";
  return `<text x="${x}" y="${y}" fill="${options.fill || "#f4f6f8"}" font-family="${FONT_FAMILY}" font-size="${options.size || 24}" font-weight="${options.weight || 400}" text-anchor="${options.anchor || "start"}" letter-spacing="${spacing}"${stroke}${opacity}>${escapeXml(label)}</text>`;
}
__name(text, "text");
function icon(name, x, y, size, color = "#8b96a3") {
  const scale = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name].join("")}</g>`;
}
__name(icon, "icon");
function peakRankMarker(label, x, y, width, accent) {
  const markerX = x + width - 206;
  return [
    `<rect x="${markerX}" y="${y + 24}" width="174" height="38" fill="#071019" opacity="0.7" stroke="${accent}" stroke-width="1" stroke-opacity="0.5" />`,
    `<rect x="${markerX}" y="${y + 24}" width="174" height="2" fill="${accent}" opacity="0.72" />`,
    `<circle cx="${markerX + 20}" cy="${y + 43}" r="3.5" fill="${accent}" opacity="0.9" />`,
    text("PEAK", markerX + 33, y + 48, {
      size: 13,
      weight: 700,
      fill: "#8b96a3",
      spacing: 2
    }),
    text(label.toUpperCase(), markerX + 158, y + 48, {
      size: 15,
      weight: 700,
      fill: "#f7f7f4",
      anchor: "end",
      maxLength: 9
    })
  ].join("");
}
__name(peakRankMarker, "peakRankMarker");
function statCell(label, value, x, y, width, iconName, accent = "#ff6b21", detail) {
  return [
    `<g>`,
    `<rect x="${x}" y="${y}" width="${width}" height="148" fill="#091018" opacity="0.42" />`,
    icon(iconName, x + 32, y + 24, 20),
    text(label, x + 64, y + 42, {
      size: 19,
      weight: 700,
      fill: "#8b96a3",
      spacing: 3
    }),
    detail ? peakRankMarker(detail, x, y, width, accent) : "",
    text(value, x + 32, y + 108, {
      size: 45,
      weight: 400,
      fill: "#f7f7f4",
      maxLength: 16
    }),
    `<rect x="${x + 32}" y="${y + 124}" width="46" height="3" fill="${accent}" />`,
    `</g>`
  ].join("");
}
__name(statCell, "statCell");
function lookupMetric(x, y, lookupCount) {
  const label = formatLookupCountLabel(lookupCount);
  return [
    `<g>`,
    `<rect x="${x}" y="${y}" width="154" height="92" fill="#071019" opacity="0.78" stroke="#2d3a45" stroke-width="2" />`,
    `<rect x="${x}" y="${y}" width="154" height="3" fill="#ffb05d" opacity="0.85" />`,
    icon("eye", x + 22, y + 24, 21, "#ffb05d"),
    text("LOOKUPS", x + 57, y + 39, {
      size: 15,
      weight: 700,
      fill: "#8b96a3",
      spacing: 2
    }),
    text(label, x + 22, y + 75, {
      size: label.length > 4 ? 27 : 31,
      weight: 700,
      fill: "#f7f7f4",
      maxLength: 5
    }),
    `</g>`
  ].join("");
}
__name(lookupMetric, "lookupMetric");
function bannedIdentityTag(x, y) {
  return [
    `<g>`,
    `<rect x="${x}" y="${y}" width="170" height="92" fill="#271012" opacity="0.88" stroke="#7d2d33" stroke-width="2" />`,
    `<rect x="${x}" y="${y}" width="170" height="3" fill="#ff6f66" opacity="0.92" />`,
    icon("ban", x + 23, y + 22, 25, "#ff8a82"),
    text("BANNED", x + 61, y + 41, {
      size: 20,
      weight: 700,
      fill: "#ff8a82",
      spacing: 3
    }),
    text("IN-GAME", x + 23, y + 74, {
      size: 16,
      weight: 700,
      fill: "#b48786",
      spacing: 2
    }),
    `</g>`
  ].join("");
}
__name(bannedIdentityTag, "bannedIdentityTag");
function identityMetaPanel(lookupCount, banned) {
  const lookupX = banned ? 990 : 1182;
  return [`<g>`, lookupMetric(lookupX, 250, lookupCount), banned ? bannedIdentityTag(1166, 250) : "", `</g>`].join("");
}
__name(identityMetaPanel, "identityMetaPanel");
function progressBar(percent, x, y, width) {
  const pct = typeof percent === "number" && Number.isFinite(percent) ? Math.round(percent) : 0;
  const fillWidth = Math.max(0, Math.min(width, pct / 100 * width));
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="12" fill="#202b36" />`,
    `<rect x="${x}" y="${y}" width="${fillWidth.toFixed(2)}" height="12" fill="#ff6b21" />`,
    text(`${pct}%`, x + width, y - 24, {
      size: 21,
      weight: 700,
      fill: "#ff8a32",
      anchor: "end",
      spacing: 2
    })
  ].join("");
}
__name(progressBar, "progressBar");
function cardStatusText(status) {
  if (status.kind === "report") {
    return `COMMUNITY REPORT ${DOT} ${status.reportReason.toUpperCase()}`;
  }
  if (status.kind === "tags") {
    return status.tags.map((tag) => tag.label.toUpperCase()).join(` ${DOT} `);
  }
  return "SECURE";
}
__name(cardStatusText, "cardStatusText");
function estimateStatusTextWidth(value, size, spacing, maxLength) {
  const label = truncate(value, maxLength);
  const characterWidth = size * 0.62;
  return label.length * characterWidth + Math.max(0, label.length - 1) * spacing;
}
__name(estimateStatusTextWidth, "estimateStatusTextWidth");
function statusPlacement(status, value) {
  if (status.kind === "report") {
    const placement2 = { size: 17, maxLength: 34, spacing: 0 };
    return {
      ...placement2,
      iconX: Math.max(
        860,
        STATUS_RIGHT_X - estimateStatusTextWidth(value, placement2.size, placement2.spacing, placement2.maxLength) - STATUS_ICON_SIZE - STATUS_ICON_GAP
      ),
      textX: STATUS_RIGHT_X
    };
  }
  if (status.kind === "tags") {
    const placement2 = { size: 19, maxLength: 32, spacing: 1 };
    return {
      ...placement2,
      iconX: Math.max(
        860,
        STATUS_RIGHT_X - estimateStatusTextWidth(value, placement2.size, placement2.spacing, placement2.maxLength) - STATUS_ICON_SIZE - STATUS_ICON_GAP
      ),
      textX: STATUS_RIGHT_X
    };
  }
  const placement = { size: 20, maxLength: 16, spacing: 3 };
  return {
    ...placement,
    iconX: STATUS_RIGHT_X - estimateStatusTextWidth(value, placement.size, placement.spacing, placement.maxLength) - STATUS_ICON_SIZE - STATUS_ICON_GAP,
    textX: STATUS_RIGHT_X
  };
}
__name(statusPlacement, "statusPlacement");
function statusMarker(status, value) {
  const placement = statusPlacement(status, value);
  return icon(status.icon, placement.iconX, STATUS_ICON_Y, STATUS_ICON_SIZE, status.color);
}
__name(statusMarker, "statusMarker");
function buildPlayerCardSvg(profile, _requestedBy = "Patch", report, tags = [], lookupCount) {
  const name = displayName(profile);
  const season = latestSeason(profile);
  const ranked = season?.ranked;
  const level = profile.basicInfo?.playerLevel?.level;
  const levelLabel = typeof level === "number" && Number.isFinite(level) ? String(level) : "?";
  const currentRank = rankName(profile.stats?.ranked);
  const peakRank = peakRankName(profile.stats?.ranked);
  const progress = rankProgress(profile.stats?.ranked);
  const banned = hasActiveBan(profile.ban);
  const status = publicStatusFor(report, tags);
  const statusText = cardStatusText(status);
  const statusPosition = statusPlacement(status, statusText);
  const topMetadata = topMetadataLine();
  const identity = `${formatRawId(profile.basicInfo?.userID)} ${DOT} ${clanLine(profile)}`;
  const footerLabel = `LAST SYNC ${DOT} JUST NOW`;
  const progressLabel = `RANK PROGRESS ${DOT} ${currentRank.toUpperCase()} -> ${progress.nextLabel.toUpperCase()}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#101820" />
      <stop offset="58%" stop-color="#050b11" />
      <stop offset="100%" stop-color="#111820" />
    </linearGradient>
    <linearGradient id="ban-glow" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#ff3b30" stop-opacity="0.34" />
      <stop offset="42%" stop-color="#ff3b30" stop-opacity="0.13" />
      <stop offset="100%" stop-color="#ff3b30" stop-opacity="0" />
    </linearGradient>
    <pattern id="fine-grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0 L0 0 0 44" fill="none" stroke="#1a2631" stroke-width="1" opacity="0.35" />
    </pattern>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#05080d" />
  <rect x="25" y="24" width="1360" height="888" fill="url(#card-bg)" stroke="#25313c" stroke-width="2" />
  <rect x="25" y="24" width="1360" height="888" fill="url(#fine-grid)" opacity="0.22" />
  ${banned ? `<rect x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#ban-glow)" />` : ""}
  <path d="M25 24 H58 L25 56 Z M1385 24 H1354 L1385 56 Z M25 912 H58 L25 880 Z M1385 912 H1354 L1385 880 Z" fill="#ff6b21" />
  <path d="M10 8 H57 M10 8 V55 M1400 8 H1355 M1400 8 V55 M10 928 H57 M10 928 V881 M1400 928 H1355 M1400 928 V881" stroke="#ff6b21" stroke-width="4" fill="none" />
  <path d="M76 136 H1336" stroke="#26313b" stroke-width="2" />
  <circle cx="1273" cy="88" r="8" fill="#e9323d" />
  <circle cx="1301" cy="88" r="8" fill="#e86c2a" />
  <circle cx="1329" cy="88" r="8" fill="#11d1d6" />

  ${text("PATCH", 76, 94, { size: 20, weight: 700, fill: "#11d1d6", spacing: 5 })}
  ${text(`${DOT} PROFILE CARD`, 174, 94, {
    size: 20,
    weight: 700,
    fill: "#8b96a3",
    maxLength: 34
  })}
  ${text(topMetadata, 76, 201, { size: 24, fill: "#f7f7f4", maxLength: 56 })}

  ${rankIcon(currentRank, 76, 233)}
  ${text(name, 236, 295, { size: 39, fill: "#f7f7f4", maxLength: 24 })}
  <circle cx="243" cy="326" r="8" fill="#11d1d6" />
  ${text(identity, 267, 333, {
    size: 22,
    fill: "#8b96a3",
    maxLength: 48
  })}
  ${identityMetaPanel(lookupCount, banned)}

  <rect x="76" y="402" width="1260" height="300" fill="#071019" opacity="0.68" />
  <path d="M706 402 V702 M76 552 H1336" stroke="#26313b" stroke-width="2" />
  ${statCell("K/D RATIO", kd(ranked), 76, 402, 630, "crosshair", "#ff6b21")}
  ${statCell("WIN RATE", compactPercent(winRate(ranked)), 706, 402, 630, "trophy", "#11d1d6")}
  ${statCell("RANK", currentRank, 76, 552, 630, "gem", "#11d1d6", peakRank)}
  ${statCell("LEVEL", levelLabel, 706, 552, 630, "chevrons-up", "#ff6b21")}

  ${text(progressLabel, 76, 765, {
    size: 20,
    weight: 700,
    fill: "#8b96a3",
    spacing: 4,
    maxLength: 48
  })}
  ${progressBar(progress.percent, 76, 789, 1260)}

  ${text(footerLabel, 76, 856, {
    size: 20,
    weight: 700,
    fill: "#8b96a3",
    spacing: 4,
    maxLength: 48
  })}
  ${statusMarker(status, statusText)}
  ${text(statusText, statusPosition.textX, 856, {
    size: statusPosition.size,
    weight: 700,
    fill: status.color,
    anchor: "end",
    maxLength: statusPosition.maxLength,
    spacing: statusPosition.spacing
  })}
</svg>`;
}
__name(buildPlayerCardSvg, "buildPlayerCardSvg");
function ensureResvgInitialized() {
  resvgInitPromise ||= initWasm(resvgWasm).catch((error) => {
    resvgInitPromise = void 0;
    throw error;
  });
  return resvgInitPromise;
}
__name(ensureResvgInitialized, "ensureResvgInitialized");
function renderSvgToPng(svg) {
  const renderer = new Resvg2(svg, {
    fitTo: { mode: "width", value: CARD_OUTPUT_WIDTH },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: "JetBrains Mono",
      sansSerifFamily: "JetBrains Mono",
      monospaceFamily: "JetBrains Mono",
      fontBuffers: FONT_BUFFERS
    }
  });
  let rendered;
  try {
    rendered = renderer.render();
    return rendered.asPng();
  } finally {
    rendered?.free();
    renderer.free();
  }
}
__name(renderSvgToPng, "renderSvgToPng");
async function warmPlayerCardRenderer() {
  resvgWarmupPromise ||= (async () => {
    await ensureResvgInitialized();
    renderSvgToPng(buildPlayerCardSvg(WARMUP_PROFILE, "Patch"));
  })().catch((error) => {
    resvgWarmupPromise = void 0;
    throw error;
  });
  return resvgWarmupPromise;
}
__name(warmPlayerCardRenderer, "warmPlayerCardRenderer");
async function renderPlayerCardPng(profile, requestedBy, report, tags = [], lookupCount) {
  await ensureResvgInitialized();
  const png = renderSvgToPng(buildPlayerCardSvg(profile, requestedBy, report, tags, lookupCount));
  resvgWarmupPromise ||= Promise.resolve();
  return png;
}
__name(renderPlayerCardPng, "renderPlayerCardPng");

// src/lib/reporting.ts
function monthId(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
__name(monthId, "monthId");
function previousMonthRange(now) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    month: monthId(start),
    start,
    end
  };
}
__name(previousMonthRange, "previousMonthRange");
function inRange(isoDate, start, end) {
  if (!isoDate) {
    return false;
  }
  const timestamp2 = Date.parse(isoDate);
  return Number.isFinite(timestamp2) && timestamp2 >= start.getTime() && timestamp2 < end.getTime();
}
__name(inRange, "inRange");
async function refreshStaffReviewAnalytics(env) {
}
__name(refreshStaffReviewAnalytics, "refreshStaffReviewAnalytics");
async function buildMonthlyCommunityRecap(env, now = /* @__PURE__ */ new Date()) {
  const { month, start, end } = previousMonthRange(now);
  const [reports, acceptedReports, trackers] = await Promise.all([
    env.USER_PREFERENCES ? listReports(env) : Promise.resolve([]),
    env.USER_PREFERENCES ? listAcceptedReports(env) : Promise.resolve([]),
    env.USER_PREFERENCES ? listTrackers(env) : Promise.resolve([])
  ]);
  const reviewedReports = reports.filter((report) => inRange(report.reviewedAt, start, end));
  const accepted = reviewedReports.filter((report) => report.status === "accepted" || report.status === "ban_confirmed");
  const declined = reviewedReports.filter((report) => report.status === "rejected");
  const confirmedReportIds = /* @__PURE__ */ new Set();
  for (const report of reports) {
    if (inRange(report.banConfirmedAt, start, end)) {
      confirmedReportIds.add(report.id);
    }
  }
  for (const report of acceptedReports) {
    if (inRange(report.banDetectedAt, start, end)) {
      confirmedReportIds.add(report.reportId);
    }
  }
  const movements = /* @__PURE__ */ new Map();
  for (const tracker of trackers) {
    for (const change of trackingChanges(tracker)) {
      const mmrDelta = change.delta.mmr;
      if (!change.latest || typeof mmrDelta !== "number" || mmrDelta <= 0) {
        continue;
      }
      if (!inRange(change.latest.capturedAt, start, end)) {
        continue;
      }
      const key = change.player.playerId || change.player.key;
      const existing = movements.get(key);
      if (!existing || (existing.mmrDelta || 0) < mmrDelta) {
        movements.set(key, {
          playerKey: key,
          playerName: change.player.label,
          mmrDelta,
          rank: change.latest.rank,
          capturedAt: change.latest.capturedAt
        });
      }
    }
  }
  return {
    month,
    generatedAt: now.toISOString(),
    reportsReviewed: reviewedReports.length,
    reportsAccepted: accepted.length,
    reportsDeclined: declined.length,
    bansConfirmed: confirmedReportIds.size,
    topRankMovements: Array.from(movements.values()).sort((a, b) => (b.mmrDelta || 0) - (a.mmrDelta || 0) || a.playerName.localeCompare(b.playerName)).slice(0, 5)
  };
}
__name(buildMonthlyCommunityRecap, "buildMonthlyCommunityRecap");
async function updateMonthlyCommunityRecapBaseline(env, now = /* @__PURE__ */ new Date()) {
  if (!env.USER_PREFERENCES || now.getUTCDate() !== 1) {
    return void 0;
  }
  const { month } = previousMonthRange(now);
  const existing = await getMonthlyCommunityRecap(env, month);
  if (existing) {
    return existing;
  }
  const recap = await buildMonthlyCommunityRecap(env, now);
  await putMonthlyCommunityRecap(env, recap);
  return recap;
}
__name(updateMonthlyCommunityRecapBaseline, "updateMonthlyCommunityRecapBaseline");
async function sendMonthlyCommunityRecap(env, now = /* @__PURE__ */ new Date()) {
  const channelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
  if (!channelId || !discordBotToken(env)) {
    return {
      sent: false,
      recap: await buildMonthlyCommunityRecap(env, now)
    };
  }
  const recap = await buildMonthlyCommunityRecap(env, now);
  await putMonthlyCommunityRecap(env, recap);
  await sendDiscordMessage(env, channelId, communityRecapMessage(recap));
  return {
    sent: true,
    recap
  };
}
__name(sendMonthlyCommunityRecap, "sendMonthlyCommunityRecap");

// src/lib/ban-watcher.ts
var BAN_WATCH_RECHECK_MS = 6 * 60 * 60 * 1e3;
var MAX_BAN_WATCH_CHECKS_PER_RUN = 20;
function recentEnough(isoDate, now) {
  if (!isoDate) {
    return false;
  }
  const checkedAt = Date.parse(isoDate);
  return Number.isFinite(checkedAt) && now.getTime() - checkedAt < BAN_WATCH_RECHECK_MS;
}
__name(recentEnough, "recentEnough");
function buildReportDecisionMessage(options) {
  return reportReceiptMessage({
    env: options.env,
    report: options.report,
    reputation: options.reputation
  });
}
__name(buildReportDecisionMessage, "buildReportDecisionMessage");
function buildReportBanMessage(options) {
  return reportReceiptMessage({
    env: options.env,
    report: options.report,
    reputation: options.reputation
  });
}
__name(buildReportBanMessage, "buildReportBanMessage");
async function sendReportDecisionDm(env, report, _accepted) {
  if (!discordBotToken(env)) {
    return;
  }
  const reputation = await getReporterReputation(env, report.reporterId);
  await sendDiscordDm(
    env,
    report.reporterId,
    buildReportDecisionMessage({
      env,
      report,
      reputation
    })
  );
}
__name(sendReportDecisionDm, "sendReportDecisionDm");
async function sendReportBanDm(env, report, confirmedReport) {
  if (!discordBotToken(env)) {
    return;
  }
  const pending = confirmedReport || await getPendingReport(env, report.reportId) || {
    id: report.reportId,
    status: "ban_confirmed",
    reporterId: report.reporterId,
    targetPlayerId: report.playerId,
    targetName: report.playerName,
    reason: report.reason,
    publicReason: report.reason,
    createdAt: report.acceptedAt || (/* @__PURE__ */ new Date()).toISOString(),
    reviewedAt: report.acceptedAt,
    reviewedBy: report.acceptedBy,
    reviewerNote: report.reviewerNote,
    banConfirmedAt: report.banDetectedAt
  };
  const reputation = await getReporterReputation(env, report.reporterId);
  await sendDiscordDm(
    env,
    report.reporterId,
    buildReportBanMessage({
      env,
      report: pending,
      reputation
    })
  );
}
__name(sendReportBanDm, "sendReportBanDm");
async function runBanWatcher(env, now = /* @__PURE__ */ new Date()) {
  const result = {
    checked: 0,
    banned: 0,
    notified: 0,
    skipped: 0
  };
  if (!env.USER_PREFERENCES || !discordBotToken(env)) {
    return result;
  }
  const reports = await listAcceptedReports(env);
  for (const report of reports) {
    if (report.banNotifiedAt || recentEnough(report.banLastCheckedAt, now)) {
      result.skipped += 1;
      continue;
    }
    if (result.checked >= MAX_BAN_WATCH_CHECKS_PER_RUN) {
      result.skipped += 1;
      continue;
    }
    result.checked += 1;
    try {
      const profile = await fetchProfileByPlayerOption(report.playerId);
      const checkedReport = {
        ...report,
        playerName: profile ? displayName(profile) : report.playerName,
        banLastCheckedAt: now.toISOString()
      };
      if (!profile || !hasActiveBan(profile.ban)) {
        await putAcceptedReport(env, checkedReport);
        continue;
      }
      result.banned += 1;
      const confirmedAt = now.toISOString();
      const detectedReport = {
        ...checkedReport,
        banDetectedAt: confirmedAt
      };
      const confirmedPending = await markPendingReportBanConfirmed(env, report.reportId, confirmedAt);
      if (!confirmedPending && !report.banDetectedAt) {
        await recordReportBanConfirmed(env, report.reporterId, confirmedAt);
      }
      try {
        await sendReportBanDm(env, detectedReport, confirmedPending);
        result.notified += 1;
      } catch (dmError) {
        console.error("Failed to notify primary reporter", dmError);
      }
      if (report.duplicateReports && report.duplicateReports.length > 0) {
        for (const dup of report.duplicateReports) {
          try {
            const dupConfirmedPending = await markPendingReportBanConfirmed(env, dup.reportId, confirmedAt);
            await recordReportBanConfirmed(env, dup.reporterId, confirmedAt);
            const dupPlayerReport = {
              ...detectedReport,
              reporterId: dup.reporterId,
              reportId: dup.reportId
            };
            await sendReportBanDm(env, dupPlayerReport, dupConfirmedPending);
            result.notified += 1;
          } catch (dupError) {
            console.error("Failed to notify duplicate reporter", {
              reporterId: dup.reporterId,
              error: dupError
            });
          }
        }
      }
      await putAcceptedReport(env, {
        ...detectedReport,
        banNotifiedAt: confirmedAt
      });
      await refreshStaffReviewAnalytics(env);
    } catch (error) {
      console.error("Ban watcher failed for accepted report", {
        reportId: report.reportId,
        playerId: report.playerId,
        reporterId: report.reporterId,
        error
      });
    }
  }
  return result;
}
__name(runBanWatcher, "runBanWatcher");

// src/lib/onboarding.ts
var ONBOARDING_COMMANDS = /* @__PURE__ */ new Set(["help", "stats", "profile", "compare", "track", "report"]);
function buildOnboardingMessage(env) {
  return v2Message([
    container([
      textDisplay(
        [
          "## Welcome to Patch",
          "You just used Patch for the first time, so here is the quick map.",
          bulletList([
            "`/profile` opens the player hub.",
            "`/track` shows changes when you ask for them.",
            "`/report` is there when you have image or video proof staff should review."
          ]),
          `Ideas, questions, and updates live in Patch Labs: ${supportServerUrl(env)}`,
          "That is the whole starter kit. I will keep the inbox quiet from here."
        ].join("\n\n")
      )
    ])
  ]);
}
__name(buildOnboardingMessage, "buildOnboardingMessage");
async function startOnboarding(interaction, env, commandName) {
  const userId = interactionUserId(interaction);
  if (!userId || !env.USER_PREFERENCES || !discordBotToken(env)) {
    return;
  }
  if (await getOnboardingRecord(env, userId)) {
    return;
  }
  await markOnboardingStarted(env, userId, commandName);
  try {
    await sendDiscordDm(env, userId, buildOnboardingMessage(env));
  } catch (error) {
    console.error("Failed to send onboarding DM", {
      userId,
      commandName,
      error
    });
  }
}
__name(startOnboarding, "startOnboarding");
function startOnboardingSoon(interaction, env, commandName, runtime) {
  if (!ONBOARDING_COMMANDS.has(commandName) || !runtime?.waitUntil) {
    return;
  }
  runInBackground(runtime, () => startOnboarding(interaction, env, commandName));
}
__name(startOnboardingSoon, "startOnboardingSoon");

// src/lib/homepage.ts
import copsWeapon from "./dff4bc107900eb6df24e3ad0ab6afa1d26dce4ca-cops-ak47.png";
import copsBreach from "./accb2aa94f3ca1decf2cb1770f27953cc4dac509-cops-breach.png";
import copsCoalition from "./aa8ae2bed8739f6cf07d079ade4d1fe342a05e13-cops-coalition.png";
import copsHero from "./9c89dc55b06b92a57c2c927a3b8ebe05bd656ed4-cops-hero.jpg";
import copsLogo from "./d90e8b6039f736b5796cebb22bfa12ce9ba8822c-cops-logo-short.png";
import rank6Icon2 from "./d04c49cb88ac6b90516f6a14900745fea69f3544-rank-6-master.png";
import rank7Icon2 from "./c8be7122d1c00aceeea20336413059c23ee88244-rank-7-specops.png";
import rank8Icon2 from "./0637d67230ac8e14b622979fa4c43b677c0a18cb-rank-8-elite.png";
function dataUri(buffer, mimeType) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}
__name(dataUri, "dataUri");
var ART = {
  hero: dataUri(copsHero, "image/jpeg"),
  coalition: dataUri(copsCoalition, "image/png"),
  breach: dataUri(copsBreach, "image/png"),
  weapon: dataUri(copsWeapon, "image/png"),
  copsLogo: dataUri(copsLogo, "image/png"),
  master: dataUri(rank6Icon2, "image/png"),
  specops: dataUri(rank7Icon2, "image/png"),
  elite: dataUri(rank8Icon2, "image/png")
};
function htmlEscape(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(htmlEscape, "htmlEscape");
function discordInviteUrl(env) {
  const configured = env.PATCH_INVITE_URL?.trim();
  if (configured) {
    return configured;
  }
  const applicationId = env.DISCORD_APPLICATION_ID?.trim();
  if (!applicationId) {
    return supportServerUrl(env);
  }
  const params = new URLSearchParams({
    client_id: applicationId,
    permissions: "0",
    scope: "bot applications.commands"
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
__name(discordInviteUrl, "discordInviteUrl");
function promoKitUrl(env) {
  return env.PROMO_KIT_URL?.trim() || "#promo-kit";
}
__name(promoKitUrl, "promoKitUrl");
function canonicalUrl(request, env) {
  return env.WEBSITE_URL?.trim() || new URL(request.url).origin;
}
__name(canonicalUrl, "canonicalUrl");
function styles() {
  return String.raw`
:root {
  color-scheme: dark;
  --black: #000;
  --white: #f6f6f2;
  --muted: rgba(246, 246, 242, 0.72);
  --soft: rgba(246, 246, 242, 0.48);
  --line: rgba(255, 255, 255, 0.14);
  --orange: #d86f18;
  --orange-bright: #ff8a20;
  --discord: #5865f2;
  --cyan: #8ac8ff;
  --danger: #e46243;
  --font: "Arial Narrow", "Roboto Condensed", "HelveticaNeue-CondensedBold", "Helvetica Neue", Arial, sans-serif;
  --mono: "SFMono-Regular", "JetBrains Mono", Consolas, monospace;
  --pad: clamp(24px, 7vw, 128px);
  --max: 1540px;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--black);
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--black);
  color: var(--white);
  font-family: var(--font);
  font-stretch: condensed;
  letter-spacing: 0;
}

body::selection {
  background: var(--orange);
  color: #fff;
}

a {
  color: inherit;
}

.site {
  overflow: hidden;
  background: #000;
}

.topbar {
  position: absolute;
  z-index: 10;
  top: clamp(24px, 4vw, 70px);
  left: var(--pad);
  right: var(--pad);
  display: flex;
  align-items: flex-start;
  gap: clamp(18px, 3vw, 46px);
}

.brand {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.38);
  font-size: clamp(1.15rem, 2.4vw, 3rem);
  font-weight: 800;
  line-height: 0.9;
  text-decoration: none;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0 clamp(18px, 2.4vw, 42px);
  max-width: 1320px;
}

.nav a {
  color: #fff;
  font-size: clamp(1.18rem, 2.35vw, 3.05rem);
  font-weight: 900;
  line-height: 0.98;
  text-decoration: none;
  text-transform: uppercase;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.78);
  transition: color 150ms ease, opacity 150ms ease;
}

.nav a:hover,
.nav a:focus-visible {
  color: var(--orange-bright);
}

.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: stretch;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.18) 54%, #000 100%),
    url("${ART.hero}") center 38% / cover no-repeat;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 72% 72%, rgba(224, 76, 25, 0.55), transparent 28%),
    linear-gradient(90deg, rgba(0, 0, 0, 0.72), transparent 26%, transparent 68%, rgba(0, 0, 0, 0.64)),
    linear-gradient(180deg, rgba(0, 0, 0, 0.22), transparent 58%, #000 96%);
}

.hero-word {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: max-content;
  color: #fff;
  font-size: clamp(8.2rem, 28vw, 39rem);
  font-weight: 1000;
  letter-spacing: -0.045em;
  line-height: 0.72;
  text-transform: uppercase;
  text-shadow: 0 0 32px rgba(0, 0, 0, 0.24);
  white-space: nowrap;
}

.hero-copy {
  position: relative;
  z-index: 3;
  align-self: end;
  justify-self: center;
  width: min(720px, calc(100% - 48px));
  margin-bottom: clamp(44px, 8vh, 112px);
  text-align: center;
  text-shadow: 0 3px 22px rgba(0, 0, 0, 0.9);
}

.hero-copy p {
  margin: 0 auto;
  color: #fff;
  font-size: clamp(1.04rem, 1.7vw, 2rem);
  font-weight: 500;
  line-height: 1.28;
}

.hero-ctas,
.mini-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}

.store-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 190px;
  min-height: 54px;
  padding: 9px 18px 10px;
  border: 2px solid rgba(255, 255, 255, 0.58);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.4);
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}

.store-button small {
  display: block;
  margin-bottom: 2px;
  color: var(--soft);
  font-size: 0.62rem;
  font-weight: 800;
}

.store-button:hover,
.store-button:focus-visible {
  transform: translateY(-2px);
  border-color: var(--orange-bright);
  background: #070707;
}

.store-button.discord {
  border-color: rgba(88, 101, 242, 0.88);
}

.screen-strip {
  min-height: clamp(260px, 42vw, 640px);
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.12), #000 90%),
    linear-gradient(90deg, #000, transparent 18%, transparent 62%, #000),
    url("${ART.hero}") center 62% / cover no-repeat;
  opacity: 0.58;
  filter: saturate(0.72) contrast(1.12) brightness(0.6);
}

.section {
  position: relative;
  width: min(100%, var(--max));
  margin: 0 auto;
  padding: clamp(58px, 10vw, 160px) var(--pad);
}

.split {
  display: grid;
  grid-template-columns: minmax(220px, 0.42fr) minmax(0, 0.58fr);
  gap: clamp(26px, 6vw, 112px);
  align-items: center;
}

.stack-title {
  margin: 0;
  color: #fff;
  font-size: clamp(2.6rem, 5.2vw, 6.6rem);
  font-weight: 500;
  line-height: 1.12;
  text-transform: uppercase;
}

.body {
  max-width: 520px;
}

.body p,
.fine-print,
.tab-copy,
.faq p,
.support-card p {
  color: var(--muted);
  font-family: Arial, Helvetica, sans-serif;
  font-stretch: normal;
  font-size: clamp(0.94rem, 1vw, 1.16rem);
  line-height: 1.44;
}

.body p {
  margin: 24px 0 0;
}

.image-word {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 0;
  background: url("${ART.hero}") center / cover no-repeat;
  color: transparent;
  font-size: clamp(3.5rem, 7.8vw, 10.5rem);
  font-weight: 1000;
  line-height: 0.82;
  text-transform: uppercase;
  -webkit-background-clip: text;
  background-clip: text;
}

.image-word.orange {
  background-image:
    linear-gradient(90deg, rgba(255, 115, 15, 0.34), rgba(255, 255, 255, 0.08)),
    url("${ART.hero}");
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 34px;
}

.tab {
  padding-bottom: 3px;
  border-bottom: 2px dotted rgba(255, 255, 255, 0.28);
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  font-stretch: normal;
  font-size: 0.95rem;
}

.tab.active {
  padding: 2px 6px 4px;
  border: 0;
  background: var(--orange);
}

.tab-copy {
  max-width: 920px;
  margin-top: 22px;
}

.profile-board {
  position: relative;
  min-height: 520px;
}

.profile-board::before {
  content: "";
  position: absolute;
  inset: 18% 0 auto auto;
  width: min(38vw, 520px);
  height: min(38vw, 520px);
  background: url("${ART.weapon}") center / contain no-repeat;
  opacity: 0.2;
  filter: invert(1);
}

.player-card {
  position: relative;
  z-index: 1;
  width: min(100%, 570px);
  margin-left: auto;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(0, 0, 0, 0.68);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
}

.card-head,
.card-rank,
.mini-grid,
.flow-row,
.stat-row {
  display: grid;
  gap: 12px;
}

.card-head {
  grid-template-columns: 72px 1fr auto;
  align-items: center;
}

.avatar {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.1);
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
}

.label {
  color: var(--soft);
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.player-card h3,
.support-card h3,
.faq h3 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.45rem, 2vw, 2.35rem);
  font-weight: 900;
  line-height: 0.96;
  text-transform: uppercase;
}

.card-rank {
  grid-template-columns: auto 1fr auto;
  align-items: center;
  margin-top: 26px;
  padding: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
}

.card-rank img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.rank-value {
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  line-height: 0.9;
}

.rank-value span {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
}

.mmr {
  color: var(--orange-bright);
  font-family: var(--mono);
  font-size: 1.55rem;
  font-weight: 900;
  text-align: right;
}

.mini-grid {
  grid-template-columns: repeat(3, 1fr);
  margin-top: 12px;
}

.mini-grid div,
.flow-row,
.stat-row,
.support-card,
.faq {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.045);
}

.mini-grid div {
  padding: 14px;
}

.mini-grid strong {
  display: block;
  margin-top: 8px;
  font-family: var(--mono);
  font-size: 1.08rem;
}

.ranking {
  min-height: 720px;
}

.medal-stage {
  position: relative;
  min-height: 500px;
}

.case-glow {
  position: absolute;
  inset: 8% 0 auto auto;
  width: min(48vw, 640px);
  aspect-ratio: 1.6;
  background: radial-gradient(circle at 50% 55%, rgba(255, 255, 255, 0.18), transparent 42%);
  opacity: 0.55;
}

.rank-medals {
  position: absolute;
  right: 0;
  top: 16%;
  display: flex;
  align-items: flex-end;
  gap: clamp(14px, 3vw, 42px);
}

.rank-medals img {
  width: clamp(86px, 11vw, 180px);
  filter: drop-shadow(0 24px 34px rgba(0, 0, 0, 0.6));
}

.rank-medals img:nth-child(2) {
  width: clamp(120px, 15vw, 240px);
}

.quote {
  padding-top: clamp(40px, 7vw, 110px);
  padding-bottom: clamp(80px, 10vw, 180px);
}

.mega {
  margin: 0;
  max-width: 1150px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(138, 200, 255, 0.22)),
    url("${ART.hero}") center / cover no-repeat;
  color: transparent;
  font-size: clamp(4.4rem, 10.8vw, 15rem);
  font-weight: 1000;
  line-height: 0.8;
  text-transform: uppercase;
  -webkit-background-clip: text;
  background-clip: text;
}

.proof {
  display: grid;
  grid-template-columns: 0.8fr 1fr;
  gap: clamp(32px, 6vw, 112px);
  align-items: center;
}

.flow {
  display: grid;
  gap: 12px;
}

.flow-row {
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 18px;
}

.flow-row strong,
.stat-row strong {
  color: #fff;
  font-size: 1.08rem;
  text-transform: uppercase;
}

.flow-row span:last-child {
  color: var(--orange-bright);
  font-family: var(--mono);
  font-size: 0.76rem;
  text-transform: uppercase;
}

.num {
  color: var(--orange-bright);
  font-family: var(--mono);
  font-weight: 900;
}

.support {
  display: grid;
  grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1fr);
  gap: clamp(26px, 5vw, 88px);
  align-items: start;
}

.support-card {
  padding: 24px;
}

.support-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.stat-row {
  padding: 16px;
}

.stat-row strong {
  display: block;
}

.stat-row span {
  color: var(--muted);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.88rem;
}

.warning {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.74);
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.44;
}

.warning strong {
  color: var(--danger);
}

.proof-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 30px;
}

.proof-slot {
  min-height: 118px;
  padding: 14px;
  border: 1px solid var(--line);
}

.proof-slot strong {
  display: block;
  color: #fff;
  font-size: 1rem;
  text-transform: uppercase;
}

.proof-slot span {
  display: block;
  margin-top: 12px;
  color: var(--orange-bright);
  font-family: var(--mono);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
}

.faq {
  min-height: 230px;
  padding: 18px;
}

.final {
  position: relative;
  min-height: 82svh;
  display: grid;
  place-items: center;
  padding: clamp(70px, 10vw, 160px) var(--pad);
  text-align: center;
  overflow: hidden;
}

.final::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.38) 38%, #000 100%),
    url("${ART.hero}") center 44% / cover no-repeat;
  opacity: 0.72;
  filter: saturate(0.8) brightness(0.78);
}

.final-inner {
  position: relative;
  z-index: 1;
}

.final h2 {
  margin: 0 auto;
  max-width: 1150px;
  color: #fff;
  font-size: clamp(3.8rem, 9.4vw, 13rem);
  font-weight: 1000;
  line-height: 0.78;
  text-transform: uppercase;
}

.character {
  position: absolute;
  bottom: -6%;
  width: min(28vw, 420px);
  max-height: 80%;
  object-fit: contain;
  opacity: 0.56;
  pointer-events: none;
}

.character.left {
  left: 0;
}

.character.right {
  right: 1%;
  transform: scaleX(-1);
}

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px 28px;
  padding: 34px var(--pad) 44px;
  color: var(--soft);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.86rem;
}

.footer a {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 4px;
}

.footer-logo {
  width: 68px;
  height: auto;
  opacity: 0.56;
}

@media (max-width: 1120px) {
  .split,
  .proof,
  .support {
    grid-template-columns: 1fr;
  }

  .profile-board,
  .ranking,
  .medal-stage {
    min-height: auto;
  }

  .player-card {
    margin-left: 0;
  }

  .rank-medals,
  .case-glow {
    position: relative;
    inset: auto;
    margin-top: 40px;
  }

  .faq-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  :root {
    --pad: 24px;
  }

  .topbar {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    padding: 20px var(--pad) 0;
    background: #000;
  }

  .nav a {
    font-size: clamp(1.18rem, 7.5vw, 2.4rem);
  }

  .brand {
    display: none;
  }

  .hero {
    min-height: 760px;
    margin-top: -1px;
  }

  .hero-word {
    top: 43%;
    font-size: clamp(7rem, 33vw, 14rem);
  }

  .hero-copy {
    margin-bottom: 46px;
  }

  .screen-strip {
    min-height: 260px;
  }

  .section {
    padding-block: 62px;
  }

  .stack-title {
    font-size: clamp(2.45rem, 12vw, 4rem);
  }

  .image-word,
  .mega,
  .final h2 {
    font-size: clamp(3.4rem, 17vw, 6rem);
  }

  .card-head,
  .card-rank,
  .flow-row {
    grid-template-columns: 1fr;
  }

  .mini-grid,
  .support-list,
  .proof-slots,
  .faq-grid {
    grid-template-columns: 1fr;
  }

  .rank-medals {
    justify-content: center;
  }

  .character {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}`;
}
__name(styles, "styles");
function homepageHtml(request, env) {
  const addUrl = htmlEscape(discordInviteUrl(env));
  const labsUrl = htmlEscape(supportServerUrl(env));
  const supportUrl = htmlEscape(supportServerUrl(env));
  const promoUrl = htmlEscape(promoKitUrl(env));
  const canonical = htmlEscape(canonicalUrl(request, env));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#000000">
  <meta name="description" content="Patch is the Critical Ops community layer for player identity, stats, tracking, and trust.">
  <meta property="og:title" content="Patch for Critical Ops communities">
  <meta property="og:description" content="Player cards, ranked context, tracking, comparisons, and proof-backed reports, built directly for Discord.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <title>Patch for Critical Ops communities</title>
  <style>${styles()}</style>
</head>
<body>
  <main class="site" aria-label="Patch homepage">
    <header class="topbar">
      <a class="brand" href="#top">Patch</a>
      <nav class="nav" aria-label="Primary">
        <a href="#cards">Cards</a>
        <a href="#stats">Stats</a>
        <a href="#tracking">Tracking</a>
        <a href="#reports">Reports</a>
        <a href="#support">Support</a>
        <a href="#faq">FAQ</a>
        <a href="${addUrl}">Add to Discord</a>
      </nav>
    </header>

    <section class="hero" id="top">
      <div class="hero-word" aria-hidden="true">Patch</div>
      <div class="hero-copy">
        <p>Patch is the Critical Ops community layer for player identity, stats, tracking, and trust.</p>
        <p>Player cards, ranked context, tracking, comparisons, and proof-backed reports, built directly for Discord.</p>
        <div class="hero-ctas">
          <a class="store-button discord" href="${addUrl}"><span><small>Install the app</small>Add Patch</span></a>
          <a class="store-button" href="${labsUrl}"><span><small>Community server</small>Patch Labs</span></a>
        </div>
      </div>
    </section>

    <div class="screen-strip" aria-hidden="true"></div>

    <section class="section split" id="cards">
      <div class="body">
        <h1 class="stack-title">Player<br>identity<br>cards</h1>
        <p>Generate clean profile cards that show rank, stats, clan, level, community status, and player identity in a format people actually want to post.</p>
        <div class="tabs" aria-label="Patch tools">
          <span class="tab active">Cards</span>
          <span class="tab">Stats</span>
          <span class="tab">Tracking</span>
          <span class="tab">Compare</span>
          <span class="tab">Report</span>
        </div>
        <p class="tab-copy">Built by the community. Designed for players, clans, and server staff.</p>
      </div>
      <div class="profile-board">
        <p class="image-word">Player<br>cards</p>
        <article class="player-card" aria-label="Patch player card preview">
          <div class="card-head">
            <span class="avatar">N</span>
            <div>
              <span class="label">Profile card</span>
              <h3>NobilisPugnam</h3>
            </div>
            <span class="label">Secure</span>
          </div>
          <div class="card-rank">
            <img src="${ART.master}" alt="Master rank badge">
            <div class="rank-value">Master<span>Peak rank: Spec Ops \xB7 Clan: TH7</span></div>
            <div class="mmr">1661<br><span class="label">MMR</span></div>
          </div>
          <div class="mini-grid">
            <div><span class="label">K/D</span><strong>2.0</strong></div>
            <div><span class="label">Win rate</span><strong>66%</strong></div>
            <div><span class="label">Season</span><strong>17</strong></div>
          </div>
        </article>
      </div>
    </section>

    <section class="section split" id="stats">
      <div class="body">
        <h2 class="stack-title">Public<br>stats<br>made clear</h2>
        <p>Patch turns public Critical Ops profile data into quick, readable context: rank, MMR, K/D, win rate, peak rank, season stats, history, and account metadata.</p>
      </div>
      <div>
        <p class="image-word orange">Ranked<br>context</p>
        <p class="tab-copy">Cleaner conversations around player performance. Easier recruitment and clan scouting. Public context without encouraging toxicity.</p>
      </div>
    </section>

    <section class="section split ranking" id="tracking">
      <div class="body">
        <h2 class="stack-title">Ranked<br>movement</h2>
        <p>Follow players over time and see what changed since your last check, including MMR, rank, kills, deaths, level, and activity.</p>
      </div>
      <div class="medal-stage" aria-label="Ranked medal visual">
        <div class="case-glow"></div>
        <div class="rank-medals">
          <img src="${ART.master}" alt="Master rank badge">
          <img src="${ART.specops}" alt="Spec Ops rank badge">
          <img src="${ART.elite}" alt="Elite rank badge">
        </div>
      </div>
    </section>

    <section class="section quote">
      <p class="fine-print">Patch makes Critical Ops Discord servers easier to run and more fun to use.</p>
      <h2 class="mega">Less rumor<br>more signal</h2>
    </section>

    <section class="section proof" id="reports">
      <div class="body">
        <h2 class="stack-title">Trust<br>and<br>fairness</h2>
        <p>Patch does not automatically accuse players and does not replace official moderation. Reports are proof-backed and staff-reviewed. Public status markers are meant to add context, not create drama.</p>
        <p>Core community safety tools should remain available to everyone. Supporting Patch should improve the experience, not buy influence.</p>
      </div>
      <div class="flow" aria-label="Report review flow">
        <div class="flow-row"><span class="num">01</span><strong>Evidence submitted</strong><span>Received</span></div>
        <div class="flow-row"><span class="num">02</span><strong>Staff review</strong><span>Private</span></div>
        <div class="flow-row"><span class="num">03</span><strong>Outcome recorded</strong><span>Reviewed</span></div>
        <div class="flow-row"><span class="num">04</span><strong>Private update</strong><span>Closed</span></div>
      </div>
    </section>

    <section class="section support" id="support">
      <div class="body">
        <h2 class="stack-title">Support<br>Patch</h2>
        <p>Patch Supporter is for players who want to keep Patch alive and get cosmetic perks, early access, and a voice in what gets built next.</p>
        <div class="mini-actions">
          <a class="store-button" href="${supportUrl}"><span><small>Patch Labs</small>Support Development</span></a>
          <a class="store-button" id="promo-kit" href="${promoUrl}" ${promoUrl === "#promo-kit" ? 'aria-disabled="true"' : ""}><span><small>Community assets</small>Promo Kit</span></a>
        </div>
      </div>
      <div>
        <article class="support-card">
          <h3>Patch Supporter</h3>
          <p>Supporter role, cosmetic profile marker, extra card themes, early experimental features, roadmap voting, more tracked player slots, and a name on the supporter wall.</p>
          <div class="support-list">
            <div class="stat-row"><strong>Cosmetic only</strong><span>Badges, themes, accents.</span></div>
            <div class="stat-row"><strong>Early access</strong><span>Experimental features.</span></div>
            <div class="stat-row"><strong>Roadmap voice</strong><span>Help shape what gets built.</span></div>
            <div class="stat-row"><strong>More tracking</strong><span>Extra tracked player slots.</span></div>
          </div>
          <p class="warning"><strong>No buying power:</strong> no report decisions, public trust, staff review, verification, partner tags, paid priority, moderation influence, or reputation changes.</p>
        </article>
        <div class="proof-slots" aria-label="Community metric placeholders">
          <div class="proof-slot"><strong>Profile cards generated</strong><span>Coming soon</span></div>
          <div class="proof-slot"><strong>Players tracked</strong><span>Live metrics soon</span></div>
          <div class="proof-slot"><strong>Reports reviewed</strong><span>Tracked in Labs</span></div>
          <div class="proof-slot"><strong>Servers using Patch</strong><span>Coming soon</span></div>
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <h2 class="stack-title">Intel</h2>
      <div class="faq-grid">
        <article class="faq"><h3>Is Patch official?</h3><p>Patch is community-built unless an official partnership is confirmed.</p></article>
        <article class="faq"><h3>Is Patch free?</h3><p>Core player tools should stay free. Paid tiers support development and unlock cosmetic, convenience, and early-access perks.</p></article>
        <article class="faq"><h3>Does Patch detect cheaters?</h3><p>No. Patch supports proof-backed community reports and staff review workflows.</p></article>
        <article class="faq"><h3>Where does the data come from?</h3><p>Patch uses public Critical Ops profile data and community-reviewed context.</p></article>
        <article class="faq"><h3>Can server staff use Patch?</h3><p>Yes. Patch includes structured report review flows for communities that configure staff channels.</p></article>
      </div>
    </section>

    <section class="final">
      <img class="character left" src="${ART.coalition}" alt="" aria-hidden="true">
      <img class="character right" src="${ART.breach}" alt="" aria-hidden="true">
      <div class="final-inner">
        <h2>Bring clearer player context to your Critical Ops community.</h2>
        <div class="hero-ctas">
          <a class="store-button discord" href="${addUrl}"><span><small>Install the app</small>Add Patch</span></a>
          <a class="store-button" href="${labsUrl}"><span><small>Community server</small>Join Patch Labs</span></a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <img class="footer-logo" src="${ART.copsLogo}" alt="Critical Ops">
      <span>Patch community layer</span>
      <span>Critical Ops media kit artwork used for game context</span>
      <a href="${supportUrl}">Patch Labs</a>
      <a href="${addUrl}">Add to Discord</a>
    </footer>
  </main>
</body>
</html>`;
}
__name(homepageHtml, "homepageHtml");
function marketingHomepage(request, env, includeBody = true) {
  return new Response(includeBody ? homepageHtml(request, env) : null, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(marketingHomepage, "marketingHomepage");

// src/commands/help.ts
var helpDefinition = {
  name: "help",
  description: "Open the Patch app dashboard.",
  type: 1,
  ...USER_INSTALLABLE_CONTEXTS
};
async function helpMessage(interaction, env, section2 = "start") {
  return helpDashboardMessage({
    env,
    section: section2
  });
}
__name(helpMessage, "helpMessage");
async function handle(interaction, env) {
  return interactionResponse(await helpMessage(interaction, env));
}
__name(handle, "handle");
async function handleHelpComponent(interaction, env) {
  const parsed = parseCustomId(interaction.data?.custom_id);
  const action = parsed?.action;
  if (action === "section") {
    return updateMessageResponse(await helpMessage(interaction, env, interaction.data?.values?.[0] || "start"));
  }
  return interactionResponse(simpleErrorMessage("Stale help control", "That help control is no longer available. Run `/help` again."));
}
__name(handleHelpComponent, "handleHelpComponent");
var helpCommand = {
  definition: helpDefinition,
  handle
};

// src/lib/profile-card-cache.ts
var CARD_CACHE_VERSION = "v13";
var LOOKUP_TTL_SECONDS = 30 * 60;
var CONTENT_TTL_SECONDS = 60 * 60;
var MEMORY_MAX_ENTRIES = 32;
var memoryCache = /* @__PURE__ */ new Map();
var textEncoder = new TextEncoder();
var PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
function isPng(body) {
  return PNG_SIGNATURE.every((byte, index) => body[index] === byte);
}
__name(isPng, "isPng");
function attachmentName(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "player"}-card.png`;
}
__name(attachmentName, "attachmentName");
function normalizedLookup(value) {
  return value.trim().toLowerCase();
}
__name(normalizedLookup, "normalizedLookup");
function remember2(key, card, ttlSeconds) {
  memoryCache.delete(key);
  memoryCache.set(key, {
    ...card,
    expiresAt: Date.now() + ttlSeconds * 1e3
  });
  while (memoryCache.size > MEMORY_MAX_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (!oldest) {
      break;
    }
    memoryCache.delete(oldest);
  }
}
__name(remember2, "remember");
function recall(key) {
  const entry = memoryCache.get(key);
  if (!entry) {
    return void 0;
  }
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return void 0;
  }
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  return entry;
}
__name(recall, "recall");
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function cacheRequest(key) {
  return new Request(`https://patch.local/profile-card-cache/${key}`);
}
__name(cacheRequest, "cacheRequest");
async function readEdgeCache(key, fallbackName) {
  const response = await caches.default.match(cacheRequest(key));
  if (!response) {
    return void 0;
  }
  const body = new Uint8Array(await response.arrayBuffer());
  if (!isPng(body)) {
    await caches.default.delete(cacheRequest(key));
    return void 0;
  }
  return {
    body,
    filename: attachmentName(fallbackName),
    description: `Patch profile card for ${fallbackName}`
  };
}
__name(readEdgeCache, "readEdgeCache");
async function writeEdgeCache(key, card, ttlSeconds) {
  await caches.default.put(
    cacheRequest(key),
    new Response(card.body, {
      headers: {
        "Cache-Control": `public, max-age=${ttlSeconds}`,
        "Content-Type": "image/png"
      }
    })
  );
}
__name(writeEdgeCache, "writeEdgeCache");
async function readKvCache(env, key, fallbackName) {
  const body = await env.USER_PREFERENCES?.get(`card-cache:${key}`, "arrayBuffer");
  if (!body) {
    return void 0;
  }
  const bytes = new Uint8Array(body);
  if (!isPng(bytes)) {
    await env.USER_PREFERENCES?.delete(`card-cache:${key}`);
    return void 0;
  }
  return {
    body: bytes,
    filename: attachmentName(fallbackName),
    description: `Patch profile card for ${fallbackName}`
  };
}
__name(readKvCache, "readKvCache");
async function writeKvCache(env, key, card, ttlSeconds) {
  await env.USER_PREFERENCES?.put(`card-cache:${key}`, card.body.slice().buffer, {
    expirationTtl: ttlSeconds
  });
}
__name(writeKvCache, "writeKvCache");
function profileCardFingerprint(profile, report, tags = []) {
  const season = latestSeason(profile);
  return JSON.stringify({
    version: CARD_CACHE_VERSION,
    name: displayName(profile),
    playerId: playerId(profile),
    level: profile.basicInfo?.playerLevel?.level,
    // Lookup counts change on every command; avoid busting the expensive PNG cache for that alone.
    ban: profile.ban,
    clan: profile.clan,
    ranked: profile.stats?.ranked,
    season: season?.season,
    seasonRanked: season?.ranked,
    report: report ? {
      reason: report.reason,
      acceptedAt: report.acceptedAt
    } : void 0,
    tags
  });
}
__name(profileCardFingerprint, "profileCardFingerprint");
async function cacheKeysForLookup(player) {
  const lookup = normalizedLookup(player);
  return {
    memory: `lookup:${lookup}`,
    durable: `lookup:${await sha256(`${CARD_CACHE_VERSION}:${lookup}`)}`
  };
}
__name(cacheKeysForLookup, "cacheKeysForLookup");
async function cacheKeysForProfile(profile, report, tags = []) {
  const fingerprint = profileCardFingerprint(profile, report, tags);
  return {
    memory: `content:${fingerprint}`,
    durable: `content:${await sha256(fingerprint)}`
  };
}
__name(cacheKeysForProfile, "cacheKeysForProfile");
function schedule(promise, waitUntil) {
  const logged = promise.catch((error) => {
    console.error("Failed to update profile card cache.", error);
  });
  if (waitUntil) {
    waitUntil(logged);
  }
}
__name(schedule, "schedule");
async function readDurableCache(key, fallbackName, env) {
  try {
    const edgeHit = await readEdgeCache(key, fallbackName);
    if (edgeHit) {
      return edgeHit;
    }
  } catch (error) {
    console.error("Failed to read profile card edge cache.", error);
  }
  try {
    return await readKvCache(env, key, fallbackName);
  } catch (error) {
    console.error("Failed to read profile card KV cache.", error);
    return void 0;
  }
}
__name(readDurableCache, "readDurableCache");
function writeDurableCache(key, card, ttlSeconds, env, waitUntil) {
  schedule(writeEdgeCache(key, card, ttlSeconds), waitUntil);
  if (env.USER_PREFERENCES) {
    schedule(writeKvCache(env, key, card, ttlSeconds), waitUntil);
  }
}
__name(writeDurableCache, "writeDurableCache");
async function clearPlayerCardLookupCaches(env, lookups) {
  const uniqueLookups = Array.from(new Set(lookups.map((lookup) => lookup.trim()).filter(Boolean)));
  await Promise.all(
    uniqueLookups.map(async (lookup) => {
      const keys = await cacheKeysForLookup(lookup);
      memoryCache.delete(keys.memory);
      await Promise.allSettled([
        caches.default.delete(cacheRequest(keys.durable)),
        env.USER_PREFERENCES?.delete(`card-cache:${keys.durable}`)
      ]);
    })
  );
}
__name(clearPlayerCardLookupCaches, "clearPlayerCardLookupCaches");
async function getOrRenderPlayerCardFromProfile(env, player, profile, waitUntil, context = {}) {
  const targetPlayerId = playerId(profile);
  const hasReport = Object.prototype.hasOwnProperty.call(context, "report");
  const hasTags = Object.prototype.hasOwnProperty.call(context, "tags");
  const [loadedReport, tagRecord] = await Promise.all([
    hasReport ? Promise.resolve(context.report) : getAcceptedReport(env, targetPlayerId),
    hasTags ? Promise.resolve(void 0) : getPlayerTagRecord(env, targetPlayerId)
  ]);
  const report = hasReport ? context.report : loadedReport;
  const tags = context.tags || tagRecord?.tags || [];
  const lookupCount = context.lookupCount;
  const display = displayName(profile);
  const lookupKeys = await cacheKeysForLookup(player);
  const contentKeys = await cacheKeysForProfile(profile, report, tags);
  const contentMemoryHit = recall(contentKeys.memory);
  if (contentMemoryHit) {
    if (!isPng(contentMemoryHit.body)) {
      memoryCache.delete(contentKeys.memory);
      memoryCache.delete(lookupKeys.memory);
    } else {
      remember2(lookupKeys.memory, contentMemoryHit, LOOKUP_TTL_SECONDS);
      return contentMemoryHit;
    }
  }
  const contentDurableHit = await readDurableCache(contentKeys.durable, display, env);
  if (contentDurableHit) {
    remember2(contentKeys.memory, contentDurableHit, CONTENT_TTL_SECONDS);
    remember2(lookupKeys.memory, contentDurableHit, LOOKUP_TTL_SECONDS);
    writeDurableCache(lookupKeys.durable, contentDurableHit, LOOKUP_TTL_SECONDS, env, waitUntil);
    return contentDurableHit;
  }
  const rendered = {
    body: await renderPlayerCardPng(profile, "Patch", report, tags, lookupCount),
    filename: attachmentName(display),
    description: `Patch profile card for ${display}`
  };
  remember2(contentKeys.memory, rendered, CONTENT_TTL_SECONDS);
  remember2(lookupKeys.memory, rendered, LOOKUP_TTL_SECONDS);
  writeDurableCache(contentKeys.durable, rendered, CONTENT_TTL_SECONDS, env, waitUntil);
  writeDurableCache(lookupKeys.durable, rendered, LOOKUP_TTL_SECONDS, env, waitUntil);
  return rendered;
}
__name(getOrRenderPlayerCardFromProfile, "getOrRenderPlayerCardFromProfile");

// src/lib/lookup-counts.ts
async function recordProfileLookup(env, profile, _userId, _lookup) {
  try {
    return await incrementPlayerLookupCount(env, playerId(profile), displayName(profile));
  } catch (error) {
    console.error("Failed to update player lookup count.", error);
    return void 0;
  }
}
__name(recordProfileLookup, "recordProfileLookup");
function recordProfileLookupSoon(env, profile, waitUntil, userId, lookup) {
  const job = recordProfileLookup(env, profile, userId, lookup);
  if (waitUntil) {
    waitUntil(job);
  }
  return job;
}
__name(recordProfileLookupSoon, "recordProfileLookupSoon");

// src/lib/profile-card-response.ts
function attachment(card) {
  return {
    id: 0,
    filename: card.filename,
    description: card.description
  };
}
__name(attachment, "attachment");
function cardFile(card) {
  return {
    filename: card.filename,
    contentType: "image/png",
    body: card.body
  };
}
__name(cardFile, "cardFile");
async function sendProfileCardResponse(interaction, env, card, profile, options = {}) {
  const file = cardFile(card);
  const presentation = options.presentation || "attachment";
  const payload = presentation === "container" ? profileCardContainerMessage({
    profile,
    attachmentUrl: `attachment://${card.filename}`
  }) : profileCardAttachmentMessage({ profile });
  const fullPayload = {
    ...payload,
    attachments: [attachment(card)]
  };
  await editOriginalInteractionResponse(env, interaction.token, fullPayload, file);
}
__name(sendProfileCardResponse, "sendProfileCardResponse");

// src/commands/report.ts
var REPORT_COOLDOWN_SECONDS = 10 * 60;
var definition = {
  name: "report",
  description: "Send a player report to Patch staff for review.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION
    },
    {
      name: "proof",
      description: "Image or video proof staff can review.",
      type: APPLICATION_COMMAND_OPTION_ATTACHMENT,
      required: true
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
function proofFromAttachment(attachment2) {
  if (!attachment2.url) {
    return void 0;
  }
  return {
    url: attachment2.url,
    filename: attachment2.filename,
    contentType: attachment2.content_type,
    size: attachment2.size
  };
}
__name(proofFromAttachment, "proofFromAttachment");
function isProofAttachment(attachment2) {
  if (!attachment2?.url) {
    return false;
  }
  const contentType = attachment2.content_type || "";
  if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|mp4|mov|m4v|webm)$/i.test(attachment2.filename || attachment2.url);
}
__name(isProofAttachment, "isProofAttachment");
function cleanModalText(value, fallback = "") {
  return (value || fallback).replace(/\s+/g, " ").trim();
}
__name(cleanModalText, "cleanModalText");
function cleanParagraph(value) {
  return (value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join("\n").trim();
}
__name(cleanParagraph, "cleanParagraph");
function linkText(value) {
  return (value || "proof").replace(/[[\]()]/g, "").slice(0, 80);
}
__name(linkText, "linkText");
function proofLine(proof) {
  if (!proof?.url) {
    return "Proof: not attached";
  }
  const label = linkText(proof.filename);
  const type = proof.contentType ? ` (${proof.contentType})` : "";
  return `Proof: [${label}](${proof.url})${type}`;
}
__name(proofLine, "proofLine");
function cooldownMessage(retryAt) {
  const retrySeconds = Math.floor(Date.parse(retryAt) / 1e3);
  return `Easy there, report cannon. Let staff chew through the last one first, then try again <t:${retrySeconds}:R>.`;
}
__name(cooldownMessage, "cooldownMessage");
function reportSubmitModal(draftId) {
  return modalResponse({
    custom_id: `report_submit:${draftId}`,
    title: "Report context",
    components: [
      labelComponent(
        "Short reason",
        textInput("report_reason", TEXT_INPUT_SHORT, {
          minLength: 3,
          maxLength: 80
        }),
        "Example: cheating, griefing, boosting, throwing"
      ),
      labelComponent(
        "What happened?",
        textInput("report_details", TEXT_INPUT_PARAGRAPH, {
          minLength: 20,
          maxLength: 1e3
        }),
        "Keep it specific. Staff gets proof plus this note."
      )
    ]
  });
}
__name(reportSubmitModal, "reportSubmitModal");
function openPrefilledReportModal(playerLookup, playerLabel) {
  return modalResponse({
    custom_id: customId("report", "profile", playerLookup),
    title: `Report ${playerLabel}`.slice(0, 45),
    components: [
      labelComponent(
        "Evidence link",
        textInput("report_evidence_url", TEXT_INPUT_SHORT, {
          minLength: 8,
          maxLength: 300
        }),
        "Paste an image or video URL. Use /report if you want to upload proof directly."
      ),
      labelComponent(
        "Short reason",
        textInput("report_reason", TEXT_INPUT_SHORT, {
          minLength: 3,
          maxLength: 80
        }),
        "Example: cheating, griefing, boosting, throwing"
      ),
      labelComponent(
        "What happened?",
        textInput("report_details", TEXT_INPUT_PARAGRAPH, {
          minLength: 20,
          maxLength: 1e3
        }),
        "Keep it specific. Staff gets proof plus this note."
      )
    ]
  });
}
__name(openPrefilledReportModal, "openPrefilledReportModal");
function reportReviewModal(reportId, action) {
  const approving = action === "accept";
  return modalResponse({
    custom_id: `report_review:${action}:${reportId}`,
    title: approving ? "Approve report" : "Decline report",
    components: [
      labelComponent(
        approving ? "Public reason" : "Decision reason",
        textInput("report_public_reason", TEXT_INPUT_SHORT, {
          minLength: 3,
          maxLength: 80
        }),
        approving ? "This is what future /stats and /profile output will show." : "Use a clean label like Not enough evidence, Wrong player, Clip too short, or Already handled."
      ),
      labelComponent(
        "Reviewer note",
        textInput("report_reviewer_note", TEXT_INPUT_PARAGRAPH, {
          minLength: 8,
          maxLength: 1e3
        }),
        "What convinced you? This stays on the reviewed staff embed."
      )
    ]
  });
}
__name(reportReviewModal, "reportReviewModal");
function reportButtons(reportId, disabled = false) {
  return [
    actionRow([
      button(`report_accept:${reportId}`, "Approve report", BUTTON_SECONDARY, disabled),
      button(`report_reject:${reportId}`, "Decline report", BUTTON_SECONDARY, disabled)
    ])
  ];
}
__name(reportButtons, "reportButtons");
function reportStatusLabel(status) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Declined";
  return "Pending review";
}
__name(reportStatusLabel, "reportStatusLabel");
function reportReviewMessage(report, options = {}) {
  const rankedStats = options.profile ? latestSeason(options.profile)?.ranked : void 0;
  const lastOnline = options.profile ? formatLastOnline(options.profile) : void 0;
  const accent = report.status === "accepted" ? UI_ACCENT_SUCCESS : report.status === "rejected" ? UI_ACCENT_DANGER : UI_ACCENT_WARNING;
  const children = [
    textDisplay(
      [
        `## Report: ${report.targetName}`,
        `Status: **${reportStatusLabel(report.status)}**`,
        bulletList([
          `Player ID: \`${report.targetPlayerId}\``,
          `Reporter: <@${report.reporterId}>`,
          options.reporterReputation ? `Reporter tier: **${reporterTierLabel(options.reporterReputation.tier)}** (${options.reporterReputation.acceptedReports} accepted, ${options.reporterReputation.rejectedReports} declined, ${options.reporterReputation.banConfirmedReports} ban confirmed)` : void 0,
          proofLine(report.proof),
          report.patternSignal ? `Signal: **multiple independent reports** from ${report.patternSignal.trustedReporterCount} trusted reporters` : void 0,
          report.createdAt ? `Submitted: ${report.createdAt}` : void 0
        ])
      ].join("\n")
    ),
    separator(),
    textDisplay(
      [
        "**Reporter summary**",
        report.reason,
        "",
        "**Details**",
        (report.details || "No extra details were submitted.").slice(0, 1e3)
      ].join("\n")
    )
  ];
  if (options.profile) {
    children.push(
      separator(false),
      textDisplay(
        [
          "**Current ranked context**",
          bulletList([
            `Rank: ${rankName(options.profile.stats?.ranked)}`,
            `Peak: ${peakRankName(options.profile.stats?.ranked) || "Unknown"}`,
            lastOnline ? `Last online: ${lastOnline}` : void 0,
            `MMR: ${formatOptionalInteger(options.profile.stats?.ranked?.mmr)}`,
            ...formatStats(rankedStats).split("\n")
          ])
        ].join("\n")
      )
    );
  }
  if (report.publicReason || report.reviewerNote) {
    children.push(
      separator(false),
      textDisplay(
        [
          "**Review outcome**",
          bulletList([
            report.publicReason ? `Reason: **${report.publicReason}**` : void 0,
            report.reviewedBy ? `Reviewer: <@${report.reviewedBy}>` : void 0,
            report.reviewedAt ? `Reviewed: <t:${Math.floor(Date.parse(report.reviewedAt) / 1e3)}:R>` : void 0
          ]),
          "",
          "**Reviewer note**",
          report.reviewerNote || "No reviewer note was added."
        ].join("\n")
      )
    );
  }
  children.push(separator(), ...reportButtons(report.id, options.disabled));
  return v2Message([
    container(children, {
      accentColor: accent
    })
  ]);
}
__name(reportReviewMessage, "reportReviewMessage");
async function handleReportReview(interaction, env) {
  const customId2 = interaction.data?.custom_id || "";
  const reportId = customId2.replace(/^report_(accept|reject):/, "");
  try {
    const report = await getPendingReport(env, reportId);
    if (!report) {
      return interactionResponse(
        simpleErrorMessage("Report unavailable", "That report is not in the queue anymore. Someone may have already handled it.")
      );
    }
    return reportReviewModal(reportId, customId2.startsWith("report_accept:") ? "accept" : "reject");
  } catch (error) {
    console.error("Failed to open report review modal", {
      reportId,
      error
    });
    return interactionResponse(
      simpleErrorMessage("Review unavailable", "The review form is not opening right now. Give it a moment and try again.")
    );
  }
}
__name(handleReportReview, "handleReportReview");
async function handleReportReviewModal(interaction, env, runtime) {
  const customId2 = interaction.data?.custom_id || "";
  const [, action, reportId] = customId2.match(/^report_review:(accept|reject):(.+)$/) || [];
  const reviewerId = interactionUserId(interaction) || "unknown";
  const publicReason = cleanModalText(modalValue(interaction, "report_public_reason"));
  const reviewerNote = cleanParagraph(modalValue(interaction, "report_reviewer_note"));
  if (!reportId || action !== "accept" && action !== "reject") {
    return interactionResponse(
      simpleErrorMessage("Review unavailable", "That review form came back scrambled. Open the report again and try once more.")
    );
  }
  if (!publicReason || !reviewerNote) {
    return interactionResponse(simpleErrorMessage("Review incomplete", "Give staff the short reason and the note."));
  }
  try {
    const report = await getPendingReport(env, reportId);
    if (!report) {
      return interactionResponse(
        simpleErrorMessage("Report unavailable", "That report is not in the queue anymore. Someone may have already handled it.")
      );
    }
    const reviewed = action === "accept" ? await acceptReport(env, report, reviewerId, publicReason, reviewerNote) : await rejectReport(env, report, reviewerId, publicReason, reviewerNote);
    if (action === "accept") {
      await clearPlayerCardLookupCaches(env, [report.targetPlayerId, report.targetName]);
    }
    const reporterReputation = await getReporterReputation(env, reviewed.reporterId);
    if (runtime?.waitUntil) {
      runtime.waitUntil(
        sendReportDecisionDm(env, reviewed, action === "accept").catch((error) => {
          console.error("Failed to DM report review outcome", {
            reportId,
            reporterId: reviewed.reporterId,
            error
          });
        })
      );
      runtime.waitUntil(refreshStaffReviewAnalytics(env));
    }
    return updateMessageResponse(
      reportReviewMessage(reviewed, {
        disabled: true,
        reporterReputation
      })
    );
  } catch (error) {
    console.error("Failed to review report", {
      reportId,
      reviewerId,
      error
    });
    return interactionResponse(
      simpleErrorMessage("Review unavailable", "The review form is not saving right now. Give it a moment and try again.")
    );
  }
}
__name(handleReportReviewModal, "handleReportReviewModal");
async function editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, waitUntil) {
  try {
    const profile = await fetchProfileByPlayerOption(draft.player);
    if (!profile || !playerId(profile)) {
      await editOriginalInteractionResponse(
        env,
        interaction.token,
        simpleErrorMessage("Player not found", "I couldn't find that player. Check the spelling or ID and send the report again.")
      );
      return;
    }
    recordProfileLookupSoon(env, profile, waitUntil, draft.reporterId, draft.player);
    const targetPlayerId = playerId(profile);
    if (!targetPlayerId) {
      await editOriginalInteractionResponse(
        env,
        interaction.token,
        simpleErrorMessage(
          "Report unavailable",
          "I found the player, but their ID did not come through cleanly. Try once more with the player ID."
        )
      );
      return;
    }
    const existingAccepted = await getAcceptedReport(env, targetPlayerId);
    if (existingAccepted) {
      const reportId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const report2 = {
        id: reportId,
        reporterId: draft.reporterId,
        targetPlayerId,
        targetName: displayName(profile),
        reason,
        details,
        proof: draft.proof,
        status: "accepted",
        createdAt: now,
        reviewedBy: existingAccepted.acceptedBy || "automated",
        reviewedAt: now,
        publicReason: existingAccepted.reason,
        reviewerNote: existingAccepted.reviewerNote || "Report automatically accepted because the user was already flagged and accepted."
      };
      existingAccepted.duplicateReports = existingAccepted.duplicateReports || [];
      if (!existingAccepted.duplicateReports.some((dup) => dup.reporterId === draft.reporterId) && existingAccepted.reporterId !== draft.reporterId) {
        existingAccepted.duplicateReports.push({
          reportId,
          reporterId: draft.reporterId,
          submittedAt: now
        });
      }
      await Promise.all([
        putPendingReport(env, report2),
        putAcceptedReport(env, existingAccepted),
        recordReportSubmitted(env, draft.reporterId, now),
        recordReportAccepted(env, draft.reporterId, now),
        putReportCooldown(env, draft.reporterId, REPORT_COOLDOWN_SECONDS),
        deleteReportDraft(env, draft.id)
      ]);
      const reporterReputation2 = await getReporterReputation(env, draft.reporterId);
      await editOriginalInteractionResponse(
        env,
        interaction.token,
        reportReceiptMessage({
          env,
          report: report2,
          reputation: reporterReputation2
        })
      );
      waitUntil?.(sendReportDecisionDm(env, report2, true));
      return;
    }
    const patternSignal = await suspiciousPatternForReport(env, targetPlayerId, draft.reporterId);
    const report = await createPendingReport(env, {
      id: crypto.randomUUID(),
      reporterId: draft.reporterId,
      targetPlayerId,
      targetName: displayName(profile),
      reason,
      details,
      proof: draft.proof,
      patternSignal
    });
    const reporterReputation = await getReporterReputation(env, draft.reporterId);
    try {
      await sendDiscordMessage(
        env,
        supportReportChannelId,
        reportReviewMessage(report, {
          profile,
          reporterReputation
        })
      );
    } catch (sendError) {
      console.error("Failed to send report to support channel", {
        supportReportChannelId,
        reportId: report.id,
        reporterId: draft.reporterId,
        targetPlayerId: report.targetPlayerId,
        error: sendError
      });
      await editOriginalInteractionResponse(
        env,
        interaction.token,
        simpleErrorMessage(
          "Staff channel unavailable",
          "I saved the report, but the staff channel did not accept the message. The bot owner should check the channel ID and permissions."
        )
      );
      return;
    }
    await Promise.all([putReportCooldown(env, draft.reporterId, REPORT_COOLDOWN_SECONDS), deleteReportDraft(env, draft.id)]);
    await editOriginalInteractionResponse(
      env,
      interaction.token,
      reportReceiptMessage({
        env,
        report,
        reputation: reporterReputation
      })
    );
    waitUntil?.(refreshStaffReviewAnalytics(env));
  } catch (error) {
    console.error("Failed to submit report", {
      reporterId: draft.reporterId,
      player: draft.player,
      error
    });
    await editOriginalInteractionResponse(
      env,
      interaction.token,
      simpleErrorMessage("Reports unavailable", "The report desk is not taking new notes right now. Give it a bit and try again.")
    );
  }
}
__name(editReportSubmitResponse, "editReportSubmitResponse");
function reportProofFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return void 0;
    }
    return {
      url: parsed.toString(),
      filename: parsed.pathname.split("/").filter(Boolean).at(-1) || "evidence link"
    };
  } catch {
    return void 0;
  }
}
__name(reportProofFromUrl, "reportProofFromUrl");
async function handlePrefilledReportModal(interaction, env, runtime) {
  const reporterId = interactionUserId(interaction);
  const player = parseCustomId(interaction.data?.custom_id)?.args.join(":") || "";
  const evidenceUrl = cleanModalText(modalValue(interaction, "report_evidence_url"));
  const reason = cleanModalText(modalValue(interaction, "report_reason"));
  const details = cleanParagraph(modalValue(interaction, "report_details"));
  const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
  const proof = reportProofFromUrl(evidenceUrl);
  if (!reporterId) {
    return interactionResponse(
      simpleErrorMessage("Report unavailable", "I can't tell who is sending this report. Try again from your own Discord account.")
    );
  }
  if (!player || !reason || !details || !proof) {
    return interactionResponse(simpleErrorMessage("Report incomplete", "Add a valid evidence link, a short reason, and the details."));
  }
  if (!env.USER_PREFERENCES || !discordBotToken(env) || !supportReportChannelId) {
    return interactionResponse(
      simpleErrorMessage(
        "Reports unavailable",
        "Reports need storage, a bot token, and a staff channel before they can land anywhere useful."
      )
    );
  }
  const blacklist = await getReportBlacklistEntry(env, reporterId);
  if (blacklist) {
    return interactionResponse(
      simpleErrorMessage("Reports paused", "Your report button is taking a staff-enforced nap. Ask the team if you think that changed.")
    );
  }
  const cooldown = await getReportCooldown(env, reporterId);
  if (cooldown) {
    return interactionResponse(simpleErrorMessage("Slow down", cooldownMessage(cooldown.retryAt)));
  }
  const draft = {
    id: crypto.randomUUID(),
    reporterId,
    player,
    proof,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  runInBackground(
    runtime,
    () => editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, runtime?.waitUntil?.bind(runtime))
  );
  return deferredInteractionResponse({ flags: EPHEMERAL });
}
__name(handlePrefilledReportModal, "handlePrefilledReportModal");
async function handleReportSubmitModal(interaction, env, runtime) {
  const draftId = (interaction.data?.custom_id || "").replace("report_submit:", "");
  const reporterId = interactionUserId(interaction);
  const reason = cleanModalText(modalValue(interaction, "report_reason"));
  const details = cleanParagraph(modalValue(interaction, "report_details"));
  const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
  if (!reporterId) {
    return interactionResponse(
      simpleErrorMessage("Report unavailable", "I can't tell who is sending this report. Try again from your own Discord account.")
    );
  }
  if (!reason || !details) {
    return interactionResponse(simpleErrorMessage("Report incomplete", "Give staff the short reason and what happened."));
  }
  if (!env.USER_PREFERENCES || !discordBotToken(env) || !supportReportChannelId) {
    return interactionResponse(
      simpleErrorMessage(
        "Reports unavailable",
        "Reports need storage, a bot token, and a staff channel before they can land anywhere useful."
      )
    );
  }
  const draft = await getReportDraft(env, draftId);
  if (!draft || draft.reporterId !== reporterId) {
    return interactionResponse(
      simpleErrorMessage("Report expired", "That report form expired. Run `/report` again and I\u2019ll hand you a fresh one.")
    );
  }
  const blacklist = await getReportBlacklistEntry(env, reporterId);
  if (blacklist) {
    return interactionResponse(
      simpleErrorMessage("Reports paused", "Your report button is taking a staff-enforced nap. Ask the team if you think that changed.")
    );
  }
  const cooldown = await getReportCooldown(env, reporterId);
  if (cooldown) {
    return interactionResponse(simpleErrorMessage("Slow down", cooldownMessage(cooldown.retryAt)));
  }
  runInBackground(
    runtime,
    () => editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, runtime?.waitUntil?.bind(runtime))
  );
  return deferredInteractionResponse({ flags: EPHEMERAL });
}
__name(handleReportSubmitModal, "handleReportSubmitModal");
async function handle2(interaction, env) {
  const reporterId = interactionUserId(interaction);
  const player = optionValue(interaction.data?.options, "player");
  const proofAttachment = optionAttachment(interaction, "proof");
  const proof = proofAttachment ? proofFromAttachment(proofAttachment) : void 0;
  const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
  if (!reporterId) {
    return interactionResponse(
      simpleErrorMessage("Report unavailable", "I can't tell who is sending this report. Try again from your own Discord account.")
    );
  }
  if (!player || !proofAttachment) {
    return interactionResponse(
      simpleErrorMessage("Report incomplete", "Give staff a player and proof: `/report player:<name-or-id> proof:<image-or-video>`.")
    );
  }
  if (!isProofAttachment(proofAttachment) || !proof) {
    return interactionResponse(simpleErrorMessage("Invalid proof", "Proof needs to be an image or video."));
  }
  if (!env.USER_PREFERENCES) {
    return interactionResponse(
      simpleErrorMessage("Reports unavailable", "Reports need storage before staff can review them. Ask the bot owner to hook up KV.")
    );
  }
  if (!discordBotToken(env)) {
    return interactionResponse(
      simpleErrorMessage("Reports unavailable", "Reports need the bot token before they can reach staff. Bot owner setup time.")
    );
  }
  if (!supportReportChannelId) {
    return interactionResponse(
      simpleErrorMessage("Reports unavailable", "Reports need a staff channel before they can land anywhere useful.")
    );
  }
  const blacklist = await getReportBlacklistEntry(env, reporterId);
  if (blacklist) {
    return interactionResponse(
      simpleErrorMessage("Reports paused", "Your report button is taking a staff-enforced nap. Ask the team if you think that changed.")
    );
  }
  const cooldown = await getReportCooldown(env, reporterId);
  if (cooldown) {
    return interactionResponse(simpleErrorMessage("Slow down", cooldownMessage(cooldown.retryAt)));
  }
  const draft = await createReportDraft(env, {
    id: crypto.randomUUID(),
    reporterId,
    player,
    proof
  });
  return reportSubmitModal(draft.id);
}
__name(handle2, "handle");
var reportCommand = {
  definition,
  handle: handle2
};

// src/commands/profile.ts
var definition2 = {
  name: "profile",
  description: "Generate a shareable player profile card.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
async function editCard(interaction, env, card, profile, presentation = "attachment") {
  await sendProfileCardResponse(interaction, env, card, profile, { presentation });
}
__name(editCard, "editCard");
async function renderAndEditCard(interaction, env, player, waitUntil, _view = "overview", presentation = "attachment") {
  try {
    const profile = await fetchProfileByPlayerOption(player);
    if (!profile) {
      await editOriginalInteractionResponse(env, interaction.token, {
        ...simpleErrorMessage("Player not found", "I couldn't find that player. Check the spelling or ID and send me back in.", false),
        attachments: []
      });
      return;
    }
    const targetPlayerId = playerId(profile);
    const userId = interactionUserId(interaction);
    const [lookupCount, report, tagRecord] = await Promise.all([
      recordProfileLookup(env, profile, userId, player),
      getAcceptedReport(env, targetPlayerId),
      getPlayerTagRecord(env, targetPlayerId)
    ]);
    const card = await getOrRenderPlayerCardFromProfile(env, player, profile, waitUntil, {
      report,
      tags: tagRecord?.tags || [],
      lookupCount
    });
    await editCard(interaction, env, card, profile, presentation);
  } catch (error) {
    console.error(error);
    try {
      await editOriginalInteractionResponse(env, interaction.token, {
        ...simpleErrorMessage(
          "Profile unavailable",
          "Profile cards are taking a slow lap right now. Give it a moment and try again.",
          false
        ),
        attachments: []
      });
    } catch (editError) {
      console.error(editError);
    }
  }
}
__name(renderAndEditCard, "renderAndEditCard");
async function handle3(interaction, env, runtime) {
  const player = optionValue(interaction.data?.options, "player");
  if (!player) {
    return interactionResponse({
      ...simpleErrorMessage("Missing player", "Drop a player first: `/profile player:<name-or-id>`."),
      flags: EPHEMERAL | 32768
    });
  }
  const waitUntil = runtime?.waitUntil?.bind(runtime);
  runInBackground(runtime, () => renderAndEditCard(interaction, env, player, waitUntil));
  return deferredInteractionResponse();
}
__name(handle3, "handle");
async function loadProfileContext(env, lookup) {
  const profile = await fetchProfileByPlayerOption(lookup);
  if (!profile) {
    return void 0;
  }
  const [report, tagRecord] = await Promise.all([getAcceptedReport(env, playerId(profile)), getPlayerTagRecord(env, playerId(profile))]);
  return {
    profile,
    report,
    tagRecord
  };
}
__name(loadProfileContext, "loadProfileContext");
async function handleProfileComponent(interaction, env, runtime) {
  const parsed = parseCustomId(interaction.data?.custom_id);
  const action = parsed?.action;
  const lookup = parsed?.args.join(":") || "";
  if (!lookup) {
    return interactionResponse(simpleErrorMessage("Stale profile control", "This profile action is missing its player key."));
  }
  if (action === "refresh") {
    runInBackground(runtime, () => renderAndEditCard(interaction, env, lookup, runtime?.waitUntil?.bind(runtime), "overview", "container"));
    return deferredUpdateMessageResponse();
  }
  if (action === "view") {
    const view = interaction.data?.values?.[0] || "overview";
    runInBackground(runtime, () => renderAndEditCard(interaction, env, lookup, runtime?.waitUntil?.bind(runtime), view, "container"));
    return deferredUpdateMessageResponse();
  }
  if (action === "compare") {
    return modalResponse({
      custom_id: customId("compare", "modal", lookup),
      title: "Compare players",
      components: [
        labelComponent(
          "Second player",
          textInput("compare_player", TEXT_INPUT_SHORT, {
            minLength: 1,
            maxLength: 64
          }),
          "Critical Ops name or player ID"
        )
      ]
    });
  }
  if (action === "report") {
    const context2 = await loadProfileContext(env, lookup);
    return openPrefilledReportModal(lookup, context2?.profile ? displayName(context2.profile) : lookup);
  }
  const context = await loadProfileContext(env, lookup);
  if (!context) {
    return updateMessageResponse(
      simpleErrorMessage(
        "Player not found",
        "That player is not in public data right now. Run `/profile` again with a fresh name or ID.",
        false
      )
    );
  }
  if (action === "stats") {
    return updateMessageResponse({
      ...statsDashboardMessage({
        profile: context.profile,
        report: context.report,
        tagRecord: context.tagRecord
      }),
      attachments: []
    });
  }
  if (action === "track") {
    const userId = interactionUserId(interaction);
    if (!userId || !env.USER_PREFERENCES) {
      return interactionResponse(simpleErrorMessage("Tracking unavailable", "Tracking needs a Discord user and KV storage."));
    }
    const result = await toggleTrackedProfile(env, userId, lookup);
    if (!result.ok) {
      return interactionResponse(
        simpleErrorMessage(
          result.reason === "full" ? "Tracking list full" : "Player not found",
          result.reason === "full" ? "Your tracking list is full at 25 players. Remove one before adding another." : "I couldn't find that player, so I left your tracking list alone."
        )
      );
    }
    return updateMessageResponse({
      ...statsDashboardMessage({
        profile: context.profile,
        report: context.report,
        tagRecord: context.tagRecord,
        view: "actions"
      }),
      attachments: []
    });
  }
  return interactionResponse(
    simpleErrorMessage("Stale profile control", "That profile action is no longer available. Run `/profile` again.")
  );
}
__name(handleProfileComponent, "handleProfileComponent");
async function handleCompareModalSubmit(interaction, env, runtime) {
  const parsed = parseCustomId(interaction.data?.custom_id);
  const lookup = parsed?.args.join(":") || "";
  const second = modalValue(interaction, "compare_player");
  runInBackground(runtime, async () => {
    try {
      const [profile1, profile2] = await Promise.all([
        fetchProfileByPlayerOption(lookup),
        fetchProfileByPlayerOption(String(second || ""))
      ]);
      if (!profile1 || !profile2) {
        await editOriginalInteractionResponse(
          env,
          interaction.token,
          simpleErrorMessage(
            "Compare unavailable",
            "I couldn't find one of those players. Check the spelling or IDs and try again.",
            false
          )
        );
        return;
      }
      const userId = interactionUserId(interaction);
      await Promise.all([
        recordProfileLookup(env, profile1, userId, lookup),
        recordProfileLookup(env, profile2, userId, String(second || ""))
      ]);
      await editOriginalInteractionResponse(env, interaction.token, compareMessage(profile1, profile2));
    } catch (error) {
      console.error(error);
      await editOriginalInteractionResponse(
        env,
        interaction.token,
        simpleErrorMessage("Compare unavailable", "The matchup board is not loading right now. Give it a bit and try again.", false)
      );
    }
  });
  return deferredInteractionResponse();
}
__name(handleCompareModalSubmit, "handleCompareModalSubmit");
var profileCommand = {
  definition: definition2,
  handle: handle3
};

// src/commands/compare.ts
var definition3 = {
  name: "compare",
  description: "Compare two players with current-season context.",
  type: 1,
  options: [
    {
      name: "player1",
      ...PLAYER_OPTION
    },
    {
      name: "player2",
      ...PLAYER_OPTION
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
function comparisonMetrics(a, b) {
  const aRanked = latestSeason(a)?.ranked;
  const bRanked = latestSeason(b)?.ranked;
  return [
    {
      label: "MMR",
      a: a.stats?.ranked?.mmr,
      b: b.stats?.ranked?.mmr,
      formatter: /* @__PURE__ */ __name((value) => formatOptionalInteger(value), "formatter"),
      diffFormatter: /* @__PURE__ */ __name((diff) => formatInteger(Math.abs(diff)), "diffFormatter")
    },
    {
      label: "Ranked K/D",
      a: kdValue(aRanked),
      b: kdValue(bRanked),
      formatter: /* @__PURE__ */ __name((value) => formatDecimal(value), "formatter"),
      diffFormatter: /* @__PURE__ */ __name((diff) => formatDecimal(Math.abs(diff)), "diffFormatter")
    },
    {
      label: "Ranked KDA",
      a: kdaValue(aRanked),
      b: kdaValue(bRanked),
      formatter: /* @__PURE__ */ __name((value) => formatDecimal(value), "formatter"),
      diffFormatter: /* @__PURE__ */ __name((diff) => formatDecimal(Math.abs(diff)), "diffFormatter")
    },
    {
      label: "Ranked winrate",
      a: winRateValue(aRanked),
      b: winRateValue(bRanked),
      formatter: /* @__PURE__ */ __name((value) => formatPercentValue(value), "formatter"),
      diffFormatter: /* @__PURE__ */ __name((diff) => `${formatDecimal(Math.abs(diff), 1)} pts`, "diffFormatter")
    },
    {
      label: "Kills/match",
      a: killsPerMatchValue(aRanked),
      b: killsPerMatchValue(bRanked),
      formatter: /* @__PURE__ */ __name((value) => formatDecimal(value), "formatter"),
      diffFormatter: /* @__PURE__ */ __name((diff) => formatDecimal(Math.abs(diff)), "diffFormatter")
    }
  ];
}
__name(comparisonMetrics, "comparisonMetrics");
function winnerForMetric(metric, aName, bName) {
  if (typeof metric.a !== "number" || typeof metric.b !== "number") {
    return {
      label: "No data",
      score: 0
    };
  }
  const diff = metric.a - metric.b;
  if (Math.abs(diff) < 1e-4) {
    return {
      label: "Dead even",
      score: 0
    };
  }
  return {
    label: diff > 0 ? aName : bName,
    score: diff > 0 ? 1 : -1
  };
}
__name(winnerForMetric, "winnerForMetric");
function comparisonSummary(metrics, aName, bName) {
  const score = metrics.reduce((total, metric) => {
    return total + winnerForMetric(metric, aName, bName).score;
  }, 0);
  if (score > 0) {
    return `${aName} has the current-season edge (${score} metrics).`;
  }
  if (score < 0) {
    return `${bName} has the current-season edge (${Math.abs(score)} metrics).`;
  }
  return "This looks even with the current-season data available.";
}
__name(comparisonSummary, "comparisonSummary");
function comparisonEdges(metrics, aName, bName) {
  return metrics.map((metric) => {
    const winner = winnerForMetric(metric, aName, bName);
    if (winner.label === "No data" || winner.label === "Dead even") {
      return `${metric.label}: ${winner.label}`;
    }
    const diff = numberOrZero(metric.a) - numberOrZero(metric.b);
    return `${metric.label}: ${winner.label} by ${metric.diffFormatter(diff)}`;
  }).join("\n");
}
__name(comparisonEdges, "comparisonEdges");
function buildCompareEmbed(playerA, playerB) {
  const aName = displayName(playerA);
  const bName = displayName(playerB);
  const metrics = comparisonMetrics(playerA, playerB);
  const aPeak = peakRankName(playerA.stats?.ranked) || "Unknown";
  const bPeak = peakRankName(playerB.stats?.ranked) || "Unknown";
  const aLastOnline = formatLastOnline(playerA);
  const bLastOnline = formatLastOnline(playerB);
  const aContext = [
    `${formatOptionalInteger(playerA.stats?.ranked?.mmr)} MMR`,
    `peak ${aPeak}`,
    aLastOnline ? `last online ${aLastOnline}` : void 0
  ].filter(Boolean).join(", ");
  const bContext = [
    `${formatOptionalInteger(playerB.stats?.ranked?.mmr)} MMR`,
    `peak ${bPeak}`,
    bLastOnline ? `last online ${bLastOnline}` : void 0
  ].filter(Boolean).join(", ");
  return {
    title: `${aName} vs ${bName}`,
    description: [
      "## Current-season matchup",
      quoteList([
        "Patch checks ranked rates and MMR from the public profile data.",
        "This is built for friendly server debates, not lifetime verdicts."
      ])
    ].join("\n"),
    color: EMBED_COLOR,
    image: embedImage("compare"),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    fields: [
      {
        name: "Overall edge",
        value: fieldValue(quoteList([comparisonSummary(metrics, aName, bName)])),
        inline: false
      },
      {
        name: "Ranks",
        value: fieldValue(
          quoteList([
            `**${aName}:** ${rankName(playerA.stats?.ranked)} (${aContext})`,
            `**${bName}:** ${rankName(playerB.stats?.ranked)} (${bContext})`
          ])
        ),
        inline: false
      },
      {
        name: "Where each player is stronger",
        value: fieldValue(quoteList(comparisonEdges(metrics, aName, bName).split("\n"))),
        inline: false
      },
      {
        name: `${aName} current ranked`,
        value: fieldValue(quoteList(formatStats(latestSeason(playerA)?.ranked).split("\n"))),
        inline: true
      },
      {
        name: `${bName} current ranked`,
        value: fieldValue(quoteList(formatStats(latestSeason(playerB)?.ranked).split("\n"))),
        inline: true
      }
    ]
  };
}
__name(buildCompareEmbed, "buildCompareEmbed");
async function editCompareResponse(interaction, env, player1, player2, waitUntil) {
  try {
    const [profile1, profile2] = await Promise.all([fetchProfileByPlayerOption(player1), fetchProfileByPlayerOption(player2)]);
    if (!profile1 || !profile2) {
      const missing = [!profile1 ? player1 : void 0, !profile2 ? player2 : void 0].filter(Boolean).join(", ");
      await editOriginalInteractionResponse(env, interaction.token, {
        ...simpleErrorMessage(
          "Compare unavailable",
          `I couldn't find **${missing}**. Check the spelling or IDs and send the matchup again.`,
          false
        )
      });
      return;
    }
    const userId = interactionUserId(interaction);
    recordProfileLookupSoon(env, profile1, waitUntil, userId, player1);
    recordProfileLookupSoon(env, profile2, waitUntil, userId, player2);
    await editOriginalInteractionResponse(env, interaction.token, compareMessage(profile1, profile2));
  } catch (error) {
    console.error(error);
    await editOriginalInteractionResponse(env, interaction.token, {
      ...simpleErrorMessage("Compare unavailable", "The matchup board is not loading right now. Give it a bit and try again.", false)
    });
  }
}
__name(editCompareResponse, "editCompareResponse");
async function handle4(interaction, env, runtime) {
  const player1 = optionValue(interaction.data?.options, "player1");
  const player2 = optionValue(interaction.data?.options, "player2");
  if (!player1 || !player2) {
    return interactionResponse({
      ...simpleErrorMessage("Missing players", "Give me two players to put side by side: `/compare player1:<name> player2:<name>`."),
      flags: EPHEMERAL | 32768
    });
  }
  runInBackground(runtime, () => editCompareResponse(interaction, env, player1, player2, runtime?.waitUntil?.bind(runtime)));
  return deferredInteractionResponse();
}
__name(handle4, "handle");
var compareCommand = {
  definition: definition3,
  handle: handle4
};

// src/commands/dev.ts
var definition4 = {
  name: "dev",
  description: "Developer-only Patch tools.",
  type: 1,
  options: [
    {
      name: "task",
      description: "Cleanup task to run.",
      type: APPLICATION_COMMAND_OPTION_STRING,
      required: true,
      choices: [
        { name: "Clear accepted report", value: "report-clear" },
        { name: "Add player tag", value: "tag-add" },
        { name: "Remove player tag", value: "tag-remove" },
        { name: "Clear player tags", value: "tag-clear" },
        { name: "Pause user reports", value: "reports-pause" },
        { name: "Resume user reports", value: "reports-resume" },
        { name: "Community recap", value: "community-recap" }
      ]
    },
    {
      name: "target",
      description: "Player name/ID, or Discord user ID/mention for report pauses.",
      type: APPLICATION_COMMAND_OPTION_STRING,
      required: false,
      min_length: 1,
      max_length: 100
    },
    {
      name: "tag",
      description: "Public tag for tag-add or tag-remove.",
      type: APPLICATION_COMMAND_OPTION_STRING,
      required: false,
      choices: PLAYER_TAG_DEFINITIONS.map((tag) => ({
        name: tag.label,
        value: tag.id
      }))
    },
    {
      name: "note",
      description: "Staff note for pausing reports.",
      type: APPLICATION_COMMAND_OPTION_STRING,
      required: false,
      min_length: 3,
      max_length: 200
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
function developerIds(env) {
  return (env.DEVELOPER_DISCORD_USER_IDS || "").split(",").map((value) => value.trim()).filter(Boolean);
}
__name(developerIds, "developerIds");
async function handleRemoveReport(env, target) {
  if (!target) {
    return interactionResponse({
      ...devDashboardMessage("Give me the player to clear: `/dev task:Clear accepted report target:<name-or-id>`.", false),
      flags: EPHEMERAL | 32768
    });
  }
  const profile = await fetchProfileByPlayerOption(target);
  const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(target) ? target : void 0;
  const targetName = profile ? displayName(profile) : target;
  if (!targetPlayerId) {
    return interactionResponse({
      ...devDashboardMessage("I couldn't resolve that player ID, so I left the accepted reports untouched.", false),
      flags: EPHEMERAL | 32768
    });
  }
  await deleteAcceptedReport(env, targetPlayerId);
  await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
  return interactionResponse({
    ...devDashboardMessage(`Accepted report removed for **${targetName}**. Future stats and profile cards get a clean read.`),
    flags: EPHEMERAL | 32768
  });
}
__name(handleRemoveReport, "handleRemoveReport");
async function resolvePlayerTarget(player) {
  const profile = await fetchProfileByPlayerOption(player);
  const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(player) ? player : void 0;
  const targetName = profile ? displayName(profile) : player;
  return {
    targetPlayerId,
    targetName
  };
}
__name(resolvePlayerTarget, "resolvePlayerTarget");
async function handleTag(interaction, env, target, task, tagValue) {
  const developerId = interactionUserId(interaction) || "unknown";
  const tag = parsePlayerTagId(tagValue);
  if (!target) {
    return interactionResponse({
      ...devDashboardMessage("Give me the player to tag: `/dev task:Add player tag target:<name-or-id> tag:<tag>`.", false),
      flags: EPHEMERAL | 32768
    });
  }
  if ((task === "tag-add" || task === "tag-remove") && !tag) {
    return interactionResponse({
      ...devDashboardMessage("Pick one of the known public tags so Patch knows what badge to show.", false),
      flags: EPHEMERAL | 32768
    });
  }
  const { targetPlayerId, targetName } = await resolvePlayerTarget(target);
  if (!targetPlayerId) {
    return interactionResponse({
      ...devDashboardMessage("I couldn't resolve that player ID, so I left the public tags untouched.", false),
      flags: EPHEMERAL | 32768
    });
  }
  if (task === "tag-add" && tag) {
    await addPlayerTag(env, targetPlayerId, targetName, tag, developerId);
    await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
    return interactionResponse({
      ...devDashboardMessage(`Added **${PLAYER_TAG_BY_ID[tag].label}** to **${targetName}**. Future stats and profile cards will show it.`),
      flags: EPHEMERAL | 32768
    });
  }
  if (task === "tag-remove" || task === "tag-clear") {
    const removedTag = task === "tag-clear" ? void 0 : tag;
    await removePlayerTag(env, targetPlayerId, removedTag, developerId);
    await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
    return interactionResponse({
      ...devDashboardMessage(
        removedTag ? `Removed **${PLAYER_TAG_BY_ID[removedTag].label}** from **${targetName}**.` : `Removed all public tags from **${targetName}**.`
      ),
      flags: EPHEMERAL | 32768
    });
  }
  return interactionResponse({
    ...devDashboardMessage("Pick a tag task so Patch knows what to do with the public tag.", false),
    flags: EPHEMERAL | 32768
  });
}
__name(handleTag, "handleTag");
async function handleReportAccess(interaction, env, target, paused, reason) {
  const developerId = interactionUserId(interaction) || "unknown";
  const userId = target?.replace(/[<@!>]/g, "");
  if (!userId || !/^\d+$/.test(userId)) {
    return interactionResponse({
      ...devDashboardMessage("Give me a Discord user ID, or a user mention I can turn into one.", false),
      flags: EPHEMERAL | 32768
    });
  }
  if (paused) {
    await putReportBlacklistEntry(env, userId, developerId, reason);
    return interactionResponse({
      ...devDashboardMessage(`Report submissions are now paused for <@${userId}>.`),
      flags: EPHEMERAL | 32768
    });
  }
  await deleteReportBlacklistEntry(env, userId);
  return interactionResponse({
    ...devDashboardMessage(`Report submissions are open again for <@${userId}>.`),
    flags: EPHEMERAL | 32768
  });
}
__name(handleReportAccess, "handleReportAccess");
async function handle5(interaction, env) {
  const userId = interactionUserId(interaction);
  if (!userId || !developerIds(env).includes(userId)) {
    return interactionResponse(simpleErrorMessage("Developer command", "That one is for the Patch dev seat."));
  }
  if (!env.USER_PREFERENCES) {
    return interactionResponse(
      simpleErrorMessage("Developer storage unavailable", "Dev report tools need KV storage before they can tidy anything up.")
    );
  }
  const task = optionValue(interaction.data?.options, "task");
  const target = optionValue(interaction.data?.options, "target");
  const tag = optionValue(interaction.data?.options, "tag");
  const note = optionValue(interaction.data?.options, "note");
  if (task === "report-clear") {
    return handleRemoveReport(env, target);
  }
  if (task === "tag-add" || task === "tag-remove" || task === "tag-clear") {
    return handleTag(interaction, env, target, task, tag);
  }
  if (task === "reports-pause" || task === "reports-resume") {
    return handleReportAccess(interaction, env, target, task === "reports-pause", note);
  }
  if (task === "community-recap") {
    const result = await sendMonthlyCommunityRecap(env);
    return interactionResponse({
      ...devDashboardMessage(
        `${result.sent ? "Posted" : "Built"} the **${result.recap.month}** community recap: ${result.recap.reportsReviewed} reviewed, ${result.recap.bansConfirmed} bans confirmed.`
      ),
      flags: EPHEMERAL | 32768
    });
  }
  return interactionResponse({
    ...devDashboardMessage("Use `/dev task:<task> target:<player-or-user>` for the dev tools.", false),
    flags: EPHEMERAL | 32768
  });
}
__name(handle5, "handle");
var devCommand = {
  definition: definition4,
  handle: handle5
};

// src/commands/stats.ts
var STATS_PAGE_LABELS = ["Overview", "Season", "All-Time"];
var definition5 = {
  name: "stats",
  description: "Read a player's public stats in clean pages.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
function statsMenu(profile, selectedIndex = 0) {
  const id = playerId(profile) || encodeURIComponent(displayName(profile)).slice(0, 48);
  return pageMenu(`stats_page:${id}`, STATS_PAGE_LABELS, selectedIndex);
}
__name(statsMenu, "statsMenu");
function plainPlayerId(profile) {
  return playerId(profile) || "Unknown";
}
__name(plainPlayerId, "plainPlayerId");
function singleLineClan(profile) {
  return formatClanMembership(profile).replace(/\n/g, " - ");
}
__name(singleLineClan, "singleLineClan");
async function buildStatsEmbeds(profile, env) {
  const seasons = profile.stats?.seasonal_stats ?? [];
  const latestSeasonNumber2 = currentSeason(seasons);
  const latestSeason2 = seasonByNumber(seasons, latestSeasonNumber2);
  const name = displayName(profile);
  const targetPlayerId = playerId(profile);
  const [report, tagRecord] = await Promise.all([
    getAcceptedReport(env || {}, targetPlayerId),
    getPlayerTagRecord(env || {}, targetPlayerId)
  ]);
  const status = publicStatusFor(report, tagRecord?.tags);
  const pages = STATS_PAGE_LABELS.length;
  const lastOnline = formatLastOnline(profile);
  const statusLines = status.kind === "report" ? ["Community status: **Report accepted**", `Public reason: **${status.reportReason}**`] : status.kind === "tags" ? [`Community status: **${status.label}**`, ...status.tags.map((tag) => `${tag.label}: ${tag.description}`)] : ["Community status: **Secure**", "No accepted report or curated tag."];
  const ranked = profile.stats?.ranked;
  const rankedStats = latestSeason2?.ranked;
  return [
    {
      title: `${name} overview`,
      color: status.kind === "secure" ? EMBED_COLOR : status.embedColor,
      description: [
        "## Quick read",
        quoteList([
          `IGN: **${name}**`,
          `ID: \`${plainPlayerId(profile)}\``,
          lastOnline ? `Last online: **${lastOnline}**` : void 0,
          `Level: **${formatOptionalInteger(profile.basicInfo?.playerLevel?.level)}**`,
          `Clan: **${singleLineClan(profile)}**`
        ])
      ].join("\n"),
      image: embedImage("stats"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      fields: [
        {
          name: "Ranked now",
          value: fieldValue(
            quoteList([
              `Rank: **${formatRank(ranked).split("\n")[0].replace("Rank: ", "")}**`,
              `Peak: **${peakRankName(ranked) || "Unknown"}**`,
              `MMR: **${formatOptionalInteger(ranked?.mmr)}**`,
              `Season K/D: **${kd(rankedStats)}**`,
              `Season win rate: **${winRate(rankedStats)}**`
            ])
          ),
          inline: true
        },
        {
          name: "Account",
          value: fieldValue(quoteList([accountCreatedEstimate(seasons), ...formatBan(profile.ban).split("\n")])),
          inline: true
        },
        {
          name: "Public status",
          value: fieldValue(section("Community read", quoteList(statusLines))),
          inline: false
        }
      ],
      footer: pageFooter(1, pages)
    },
    {
      title: `${name} season stats`,
      description: [
        "## Current season",
        quoteList([`Season: **${latestSeasonNumber2 ?? "Unknown"}**`, "Public mode stats, split out so the overview can breathe."])
      ].join("\n"),
      color: EMBED_COLOR,
      image: embedImage("stats"),
      fields: [
        statField("Ranked", latestSeason2?.ranked),
        statField("Casual", latestSeason2?.casual),
        statField("Custom", latestSeason2?.custom)
      ],
      footer: pageFooter(2, pages)
    },
    {
      title: `${name} public history`,
      description: [
        "## All-time public totals",
        quoteList(["Totals are summed from public seasonal stats.", "Good for trend checks; less useful for dramatic courtroom speeches."])
      ].join("\n"),
      color: EMBED_COLOR,
      image: embedImage("stats"),
      fields: [
        statField("Ranked", sumStats(seasons, "ranked")),
        statField("Casual", sumStats(seasons, "casual")),
        statField("Custom", sumStats(seasons, "custom"))
      ],
      footer: pageFooter(3, pages, "public seasonal totals")
    }
  ];
}
__name(buildStatsEmbeds, "buildStatsEmbeds");
async function handleStatsPage(interaction, env) {
  const customId2 = interaction.data?.custom_id || "";
  const page = Number(interaction.data?.values?.[0] || 0);
  const lookup = customId2.replace("stats_page:", "");
  const profile = await fetchProfileByPlayerOption(decodeURIComponent(lookup));
  if (!profile) {
    return updateMessageResponse({
      content: "That player slipped out of the public data for now. Run `/stats` again with the name or ID.",
      embeds: [],
      components: []
    });
  }
  const embeds = await buildStatsEmbeds(profile, env);
  const selected = Math.max(0, Math.min(embeds.length - 1, page));
  return updateMessageResponse({
    embeds: [embeds[selected]],
    components: statsMenu(profile, selected)
  });
}
__name(handleStatsPage, "handleStatsPage");
async function editStatsResponse(interaction, env, player, waitUntil) {
  try {
    const profile = await fetchProfileByPlayerOption(player);
    if (!profile) {
      await editOriginalInteractionResponse(env, interaction.token, {
        ...simpleErrorMessage("Player not found", "I couldn't find that player. Check the spelling or ID and send me back in.", false)
      });
      return;
    }
    recordProfileLookupSoon(env, profile, waitUntil, interactionUserId(interaction), player);
    const [report, tagRecord] = await Promise.all([getAcceptedReport(env, playerId(profile)), getPlayerTagRecord(env, playerId(profile))]);
    await editOriginalInteractionResponse(
      env,
      interaction.token,
      statsDashboardMessage({
        profile,
        report,
        tagRecord
      })
    );
  } catch (error) {
    console.error(error);
    await editOriginalInteractionResponse(env, interaction.token, {
      ...simpleErrorMessage("Stats unavailable", "Stats are having a quiet moment. Try again in a bit and I'll take another swing.", false)
    });
  }
}
__name(editStatsResponse, "editStatsResponse");
async function handle6(interaction, env, runtime) {
  const player = optionValue(interaction.data?.options, "player") || optionValue(interaction.data?.options, "ign") || optionValue(interaction.data?.options, "player_id");
  if (!player) {
    return interactionResponse({
      ...simpleErrorMessage("Missing player", "Drop a player first: `/stats player:<name-or-id>`."),
      flags: EPHEMERAL | 32768
    });
  }
  runInBackground(runtime, () => editStatsResponse(interaction, env, player, runtime?.waitUntil?.bind(runtime)));
  return deferredInteractionResponse();
}
__name(handle6, "handle");
async function loadStatsContext(env, lookup) {
  const profile = await fetchProfileByPlayerOption(lookup);
  if (!profile) {
    return void 0;
  }
  const [report, tagRecord] = await Promise.all([getAcceptedReport(env, playerId(profile)), getPlayerTagRecord(env, playerId(profile))]);
  return {
    profile,
    report,
    tagRecord
  };
}
__name(loadStatsContext, "loadStatsContext");
async function handleStatsComponent(interaction, env, runtime) {
  const parsed = parseCustomId(interaction.data?.custom_id);
  const action = parsed?.action;
  const lookup = parsed?.args.join(":") || "";
  if (!lookup) {
    return interactionResponse(simpleErrorMessage("Stale stats control", "This stats action is missing its player key."));
  }
  if (action === "compare") {
    return modalResponse({
      custom_id: customId("compare", "modal", lookup),
      title: "Compare players",
      components: [
        labelComponent(
          "Second player",
          textInput("compare_player", TEXT_INPUT_SHORT, {
            minLength: 1,
            maxLength: 64
          }),
          "Critical Ops name or player ID"
        )
      ]
    });
  }
  if (action === "report") {
    const context2 = await loadStatsContext(env, lookup);
    return openPrefilledReportModal(lookup, context2?.profile ? displayName(context2.profile) : lookup);
  }
  if (action === "profile") {
    runInBackground(runtime, async () => {
      try {
        const context2 = await loadStatsContext(env, lookup);
        if (!context2) {
          await editOriginalInteractionResponse(
            env,
            interaction.token,
            simpleErrorMessage("Player not found", "That player is not in public data right now.", false)
          );
          return;
        }
        const card = await getOrRenderPlayerCardFromProfile(env, lookup, context2.profile, runtime?.waitUntil?.bind(runtime), {
          report: context2.report,
          tags: context2.tagRecord?.tags || []
        });
        await sendProfileCardResponse(interaction, env, card, context2.profile, {
          presentation: "container"
        });
      } catch (error) {
        console.error(error);
        await editOriginalInteractionResponse(
          env,
          interaction.token,
          simpleErrorMessage("Profile unavailable", "Profile cards are not rendering right now. Try `/profile` again in a moment.", false)
        );
      }
    });
    return deferredUpdateMessageResponse();
  }
  const context = await loadStatsContext(env, lookup);
  if (!context) {
    return updateMessageResponse(
      simpleErrorMessage(
        "Player not found",
        "That player is not in public data right now. Run `/stats` again with a fresh name or ID.",
        false
      )
    );
  }
  if (action === "track") {
    const userId = interactionUserId(interaction);
    if (!userId || !env.USER_PREFERENCES) {
      return interactionResponse(simpleErrorMessage("Tracking unavailable", "Tracking needs a Discord user and KV storage."));
    }
    const result = await toggleTrackedProfile(env, userId, lookup);
    if (!result.ok) {
      return interactionResponse(
        simpleErrorMessage(
          result.reason === "full" ? "Tracking list full" : "Player not found",
          result.reason === "full" ? "Your tracking list is full at 25 players. Remove one before adding another." : "I couldn't find that player, so I left your tracking list alone."
        )
      );
    }
  }
  const view = action === "view" ? interaction.data?.values?.[0] || "overview" : "overview";
  return updateMessageResponse(
    statsDashboardMessage({
      profile: context.profile,
      report: context.report,
      tagRecord: context.tagRecord,
      view
    })
  );
}
__name(handleStatsComponent, "handleStatsComponent");
var statsCommand = {
  definition: definition5,
  handle: handle6
};

// src/commands/track.ts
var definition6 = {
  name: "track",
  description: "View tracked changes or add a player to your tracking dashboard.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION,
      required: false
    }
  ],
  ...USER_INSTALLABLE_CONTEXTS
};
async function dashboardForUser(env, userId, force = true) {
  const record = await getTracker(env, userId);
  await refreshTrackerRecord(env, record, { force });
  const changes = trackingChanges(record);
  const message = trackingDashboardMessage({ record, changes });
  acceptTrackerBaselines(record);
  await putTracker(env, record);
  return message;
}
__name(dashboardForUser, "dashboardForUser");
async function handleAdd(interaction, env, userId, player, runtime, responseKind = "message") {
  const result = await addTrackedProfile(env, userId, player);
  if (!result.ok) {
    return interactionResponse(
      withEphemeralFlag(
        simpleErrorMessage(
          result.reason === "full" ? "Tracking list full" : "Player not found",
          result.reason === "full" ? "Your tracking list is full at 25 players. Remove one before adding another." : "I couldn't find that player. Check the spelling or ID and send me back in."
        )
      )
    );
  }
  recordProfileLookupSoon(env, result.profile, runtime?.waitUntil?.bind(runtime), userId, player);
  const changes = trackingChanges(result.record);
  const message = trackingDashboardMessage({ record: result.record, changes });
  acceptTrackerBaselines(result.record);
  await putTracker(env, result.record);
  return responseKind === "update" ? updateMessageResponse(withEphemeralFlag(message)) : interactionResponse(withEphemeralFlag(message));
}
__name(handleAdd, "handleAdd");
async function handle7(interaction, env, runtime) {
  const userId = interactionUserId(interaction);
  if (!userId) {
    return interactionResponse(
      withEphemeralFlag(
        simpleErrorMessage("Tracking unavailable", "I can't tell who owns this tracking list. Try again from your own Discord account.")
      )
    );
  }
  if (!env.USER_PREFERENCES) {
    return interactionResponse(
      withEphemeralFlag(simpleErrorMessage("Tracking unavailable", "Tracking needs KV storage before it can remember players."))
    );
  }
  const player = optionValue(interaction.data?.options, "player");
  if (player) {
    return handleAdd(interaction, env, userId, player, runtime);
  }
  return interactionResponse(withEphemeralFlag(await dashboardForUser(env, userId, true)));
}
__name(handle7, "handle");
function addPlayerModal() {
  return modalResponse({
    custom_id: customId("track", "add-modal"),
    title: "Add tracked player",
    components: [
      labelComponent(
        "Player",
        textInput("track_player", TEXT_INPUT_SHORT, {
          minLength: 1,
          maxLength: 64
        }),
        "Critical Ops name or player ID"
      )
    ]
  });
}
__name(addPlayerModal, "addPlayerModal");
async function handleTrackComponent(interaction, env) {
  const userId = interactionUserId(interaction);
  if (!userId || !env.USER_PREFERENCES) {
    return interactionResponse(simpleErrorMessage("Tracking unavailable", "Tracking needs a Discord user and KV storage."));
  }
  const parsed = parseCustomId(interaction.data?.custom_id);
  const action = parsed?.action;
  if (action === "add") {
    return addPlayerModal();
  }
  if (action === "public" && interaction.message?.components?.length) {
    return interactionResponse({
      flags: IS_COMPONENTS_V2,
      components: interaction.message.components,
      allowed_mentions: {
        parse: []
      }
    });
  }
  const record = await getTracker(env, userId);
  if (action === "remove") {
    const key = parsed?.args.join(":") || "";
    record.players = record.players.filter((player) => player.key !== key);
    await putTracker(env, record);
    return updateMessageResponse(trackingDashboardMessage({ record, changes: trackingChanges(record) }));
  }
  if (action === "public") {
    return interactionResponse(
      trackingDashboardMessage({
        record,
        changes: trackingChanges(record),
        ephemeral: false
      })
    );
  }
  if (action === "refresh") {
    await refreshTrackerRecord(env, record, { force: true });
    const changes = trackingChanges(record);
    const message = trackingDashboardMessage({ record, changes });
    acceptTrackerBaselines(record);
    await putTracker(env, record);
    return updateMessageResponse(message);
  }
  return interactionResponse(
    simpleErrorMessage("Stale tracking control", "That tracking control is no longer available. Run `/track` again.")
  );
}
__name(handleTrackComponent, "handleTrackComponent");
async function handleTrackModalSubmit(interaction, env, runtime) {
  const userId = interactionUserId(interaction);
  const player = modalValue(interaction, "track_player");
  if (!userId || !player || !env.USER_PREFERENCES) {
    return interactionResponse(
      simpleErrorMessage("Tracking unavailable", "Give me a player and make sure tracking storage is configured.")
    );
  }
  return handleAdd(interaction, env, userId, player, runtime, "update");
}
__name(handleTrackModalSubmit, "handleTrackModalSubmit");
var trackCommand = {
  definition: definition6,
  handle: handle7
};

// src/commands/index.ts
var PUBLIC_COMMANDS = [profileCommand, reportCommand, statsCommand, trackCommand, helpCommand, compareCommand];
var COMMANDS = [...PUBLIC_COMMANDS, devCommand];
var PRIVATE_OPTION_COMMANDS = /* @__PURE__ */ new Set(["profile", "stats", "help", "compare"]);
var DISCORD_COMMANDS = [...PUBLIC_COMMANDS, devCommand].map((command) => {
  return PRIVATE_OPTION_COMMANDS.has(command.definition.name) ? withPrivateResponseOption(command.definition) : command.definition;
});

// src/index.ts
async function handleComponent(interaction, env, runtime) {
  const customId2 = interaction.data?.custom_id || "";
  const parsed = parseCustomId(customId2);
  if (parsed?.scope === "profile") {
    return handleProfileComponent(interaction, env, runtime);
  }
  if (parsed?.scope === "stats") {
    return handleStatsComponent(interaction, env, runtime);
  }
  if (parsed?.scope === "track") {
    return handleTrackComponent(interaction, env);
  }
  if (parsed?.scope === "help") {
    return handleHelpComponent(interaction, env);
  }
  if (customId2.startsWith("stats_page:")) {
    return handleStatsPage(interaction, env);
  }
  if (customId2.startsWith("report_accept:") || customId2.startsWith("report_reject:")) {
    return handleReportReview(interaction, env);
  }
  return interactionResponse(
    simpleErrorMessage("Stale control", "That menu is from an older message. Run the command again and I'll rebuild it fresh.")
  );
}
__name(handleComponent, "handleComponent");
async function handleModalSubmit(interaction, env, runtime) {
  const customId2 = interaction.data?.custom_id || "";
  const parsed = parseCustomId(customId2);
  if (parsed?.scope === "compare" && parsed.action === "modal") {
    return handleCompareModalSubmit(interaction, env, runtime);
  }
  if (parsed?.scope === "report" && parsed.action === "profile") {
    return handlePrefilledReportModal(interaction, env, runtime);
  }
  if (parsed?.scope === "track" && parsed.action === "add-modal") {
    return handleTrackModalSubmit(interaction, env, runtime);
  }
  if (customId2.startsWith("report_submit:")) {
    return handleReportSubmitModal(interaction, env, runtime);
  }
  if (customId2.startsWith("report_review:")) {
    return handleReportReviewModal(interaction, env, runtime);
  }
  return interactionResponse(
    simpleErrorMessage("Stale form", "That form is from an older Patch message. Run the command again and I\u2019ll rebuild it fresh.")
  );
}
__name(handleModalSubmit, "handleModalSubmit");
async function handleInteraction(interaction, env = {}, runtime) {
  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }
  if (interaction.type === MESSAGE_COMPONENT) {
    return handleComponent(interaction, env, runtime);
  }
  if (interaction.type === MODAL_SUBMIT) {
    return handleModalSubmit(interaction, env, runtime);
  }
  if (interaction.type !== APPLICATION_COMMAND) {
    return jsonResponse({ error: "Unknown interaction" }, 400);
  }
  const commandName = interaction.data?.name;
  const command = COMMANDS.find((candidate) => candidate.definition.name === commandName);
  if (command) {
    startOnboardingSoon(interaction, env, command.definition.name, runtime);
    return applyPrivateResponseOption(interaction, await command.handle(interaction, env, runtime));
  }
  if (commandName === "cops") {
    return applyPrivateResponseOption(
      interaction,
      await COMMANDS.find((candidate) => candidate.definition.name === "stats").handle(interaction, env, runtime)
    );
  }
  return interactionResponse({
    ...simpleErrorMessage("Command unavailable", "That command is not on Patch's board yet. Try `/help` for the menu."),
    flags: EPHEMERAL | 32768
  });
}
__name(handleInteraction, "handleInteraction");
var index_default = {
  async fetch(request, env, ctx) {
    if (request.method === "GET" || request.method === "HEAD") {
      return marketingHomepage(request, env, request.method === "GET");
    }
    if (request.method !== "POST") {
      return new Response("This endpoint accepts GET for the Patch homepage and POST for Discord interactions.", {
        status: 405,
        headers: {
          Allow: "GET, HEAD, POST",
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp2 = request.headers.get("x-signature-timestamp");
    const body = await request.text();
    if (!signature || !timestamp2) {
      return new Response("Missing Discord signature headers.", {
        status: 401
      });
    }
    const isValidRequest = await (0, import_discord_interactions.verifyKey)(body, signature, timestamp2, env.DISCORD_PUBLIC_KEY);
    if (!isValidRequest) {
      return new Response("Invalid request signature.", {
        status: 401
      });
    }
    let interaction;
    try {
      interaction = JSON.parse(body);
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }
    return handleInteraction(interaction, env, ctx);
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      warmPlayerCardRenderer().catch((error) => {
        console.error("Failed to warm profile card renderer.", error);
      })
    );
    ctx.waitUntil(runScheduledRankedUpdates(env));
    ctx.waitUntil(runBanWatcher(env));
    ctx.waitUntil(refreshStaffReviewAnalytics(env));
    ctx.waitUntil(updateMonthlyCommunityRecapBaseline(env));
  }
};
export {
  DISCORD_COMMANDS,
  buildCompareEmbed,
  buildStatsEmbeds,
  index_default as default,
  handleInteraction
};
//# sourceMappingURL=index.js.map
