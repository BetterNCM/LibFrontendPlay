import { createHookFn } from "./utils";

var registeredCalls = {};
window["registeredCalls"] = registeredCalls;

// 注册调用钩子
channel.registerCall = createHookFn(channel.registerCall, (key, fn) => {
    registeredCalls[key] ??= [];
    registeredCalls[key].push(fn);
}).function;

// 调试模式下记录日志
if (localStorage["libfrontendplay.debug"] === "true") {
    channel.call = createHookFn(channel.call, (name, callback, args) => {
        if (name === "audioplayer.onPlayProgress") return;
        return {
            args: [
                name,
                createHookFn(callback, (...args) => {
                    // 仅在调试模式下输出回调日志
                }).function,
                args,
            ],
        };
    }).function;
}
