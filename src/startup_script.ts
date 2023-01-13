/**
 * @fileoverview
 * 此处的脚本将在网易云的窗口及浏览器页面初始化时被调用
 * 是最先开始执行的脚本
 * 所以不存在任何插件依赖和 BetterNCM API
 * 如果你的插件可以在插件管理器加载你的插件期间完成需要的操作
 * 请尽量不要使用本脚本来加载东西，否则会大幅度影响加载速度
 * 同时也不要尝试侵入性大的操作，避免网易云崩溃甚至无法打开
 */

import { CONFIG } from ".";
import { createHookFn } from "./utils";

var registeredCalls = {};
window["registeredCalls"] = registeredCalls;
channel.registerCall = createHookFn(channel.registerCall, (key, fn) => {
    registeredCalls[key] ??= []
    registeredCalls[key].push(fn);
}).function;

if (true) {
    channel.call = createHookFn(channel.call, (name, callback, args) => {
        if (name === "audioplayer.onPlayProgress") return;

        if (name.includes("audio") || name.includes("player"))
            console.log(name, callback, args);
        else console.debug(name, callback, args);

        return {
            args: [
                name,
                createHookFn(callback, (...args) => {
                    if (name.includes("audio") || name.includes("player"))
                        console.log("[Callback]", name, args);
                    else console.debug("[Callback]", name, args);
                }).function,
                args,
            ],
        };
    }).function;
}