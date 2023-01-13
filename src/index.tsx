/**
 * @fileoverview
 * 此处的脚本将会在插件管理器加载插件期间被加载
 * 一般情况下只需要从这个入口点进行开发即可满足绝大部分需求
 */

import { Container } from "react-dom";
import { NCMPlugin } from "plugin";
import { useLocalStorage } from "./hooks";
import "./index.scss";
import { createHookFn } from "./utils";
let configElement;
let self: NCMPlugin;

const playerElement = document.createElement("div");
document.body.appendChild(playerElement);

plugin.onLoad(function (selfPlugin) {
    self = this.mainPlugin;
    configElement = document.createElement("div");
    ReactDOM.render(<Menu />, configElement);

    self.addEventListener("updateCurrentAudioPlayer", (event: CustomEvent) => {
        if (self.currentAudioPlayer) {
            self.currentAudioPlayer.pause();
            self.currentAudioPlayer.remove();
        }
        self.currentAudioPlayer = event.detail as typeof Audio;

        self.currentAudioPlayer.addEventListener("timeupdate", (e) => {
            registeredCalls["audioplayer.onPlayProgress"].map((fn) =>
                fn(
                    self.currentAudioId[0],
                    self.currentAudioPlayer.currentTime,
                    self.currentAudioPlayer.buffered.end(0) /
                        self.currentAudioPlayer.duration,
                ),
            );

            legacyNativeCmder.triggerRegisterCall(
                "PlayProgress",
                "audioplayer",
                self.currentAudioId[0],
                Math.round(self.currentAudioPlayer.currentTime * 100) / 100,
                self.currentAudioPlayer.buffered.end(0) /
                    self.currentAudioPlayer.duration,
            );
        });

        self.currentAudioPlayer.addEventListener("play", (e) => {
            legacyNativeCmder.triggerRegisterCall(
                "PlayState",
                "audioplayer",
                self.currentAudioId[0],
                self.currentAudioId[1],
                1,
            );
        });

        self.currentAudioPlayer.addEventListener("pause", (e) => {
            legacyNativeCmder.triggerRegisterCall(
                "PlayState",
                "audioplayer",
                self.currentAudioId[0],
                self.currentAudioId[1],
                2,
            );
        });

        self.currentAudioPlayer.addEventListener("canplay", (e) => {
            legacyNativeCmder.triggerRegisterCall(
                "PlayProgress",
                "audioplayer",
                self.currentAudioId[0],
                0,
                0,
            );

            window["registeredCalls"]["audioplayer.onLoad"][0](
                self.currentAudioId[0],
                {
                    activeCode: 0,
                    code: 0,
                    duration: self.currentAudioPlayer.duration,
                    errorCode: 0,
                    errorString: "",
                },
            );
            // self.currentAudioPlayer.play();
        });
    });

    // channel.viewCall().map((v) => {
    //     const [namespace, fn] = v.split(".");
    //     if (namespace.includes("audio") || namespace.includes("player"))
    //         legacyNativeCmder.appendRegisterCall(
    //             fn.slice(2),
    //             namespace,
    //             (...args) => {
    //                 console.log(v, ...args);
    //             },
    //         );
    //     else
    //     legacyNativeCmder.appendRegisterCall(
    //         fn.slice(2),
    //         namespace,
    //         (...args) => {
    //             console.debug(v, ...args);
    //         },
    //     );
    // });

    channel.call = 
    createHookFn(channel.call, [
        (name: string, callback: any, [audioId, audioInfo]: any) => {
            if (name !== "audioplayer.load") return;
            self.currentAudioId = [audioId, audioId];
            let {
                bitrate,
                fileSize,
                format,
                level,
                musicurl,
                path,
                md5,
                playId,
                songId,
            } = audioInfo;

            if (path)
                betterncm.fs.readFile(path).then((file) => {
                    self.dispatchEvent(
                        new CustomEvent("updateCurrentAudioPlayer", {
                            detail: new Audio(URL.createObjectURL(file)),
                        }),
                    );
                });
            else {
                channel.call(
                    "browser.getFullCookies",
                    async (cookiesObj) => {
                        const cookies = cookiesObj
                            .map((v) => `${v.Name}=${v.Value}`)
                            .join(";");
                        
                        self.dispatchEvent(
                            new CustomEvent("updateCurrentAudioPlayer", {
                                detail: new Audio(
                                    // URL.createObjectURL(
                                    //     await (
                                    //         await fetch(`http://localhost:2017/${
                                    //             musicurl.slice(7) /*http://*/
                                    //         }?xymod=2&xyssl=1`, { headers: { cookies } })
                                    //     ).blob(),
                                    // )
                                    musicurl
                                ),
                            }),
                        );
                    },
                    [APP_CONF.domain],
                );
            }
            return { cancel: true };
        },
        (name, callback, args) => {
            if (name === "audioplayer.setVolume") {
                if (self.currentAudioPlayer)
                    self.currentAudioPlayer.volume = args[2];
                callback(true);
                return { cancel: true };
            }
        },
        (name, callback, args) => {
            if (name === "audioplayer.play") {
                self.currentAudioId = [args[0], args[1]];
                if (self.currentAudioPlayer) self.currentAudioPlayer.play();

                callback();
                return { cancel: true };
            }
        },
        (name, callback, args) => {
            if (name === "audioplayer.pause") {
                if (self.currentAudioPlayer) self.currentAudioPlayer.pause();
                callback();
                return { cancel: true };
            }
        },
        (name, callback, args) => {
            if (name === "audioplayer.seek") {
                if (self.currentAudioPlayer)
                    self.currentAudioPlayer.currentTime = args[2];
                    callback();
                return { cancel: true };
            }
        },
    ]);

    channel.call = 
    createHookFn(channel.call, (name, callback, args) => {
        console.debug(name);
        if (name.includes("audio") || name.includes("player")) {
            console.log(name, callback, args);
            return {
                args: [
                    name,
                    createHookFn(callback, (...args) => {
                        console.log("[Callback]", name, args);
                    }),
                    args,
                ],
            };
        }
    });
});

function Menu() {
    return <></>;
}

plugin.onConfig(() => {
    return configElement;
});
