/**
 * @fileoverview
 * 此处的脚本将会在插件管理器加载插件期间被加载
 * 一般情况下只需要从这个入口点进行开发即可满足绝大部分需求
 */


import { useLocalStorage } from "./hooks";
import "./index.scss";
import { createHookFn } from "./utils";
let configElement;

plugin.onLoad((selfPlugin) => {
    configElement = document.createElement("div");
    ReactDOM.render(<Menu />, configElement);

    channel.call = createHookFn(channel.call, [
        (name, _,
            [audioId, audioInfo]) => {
                console.log(name)
            if (name !== "audioplayer.load") return {};
                console.log(audioInfo);
            return { cancel: true }
        }
    ])
});

function Menu() {

    return (<>
    </>)
}

plugin.onConfig(() => {
    return configElement;
});
