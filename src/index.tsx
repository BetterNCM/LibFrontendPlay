/**
 * @fileoverview
 * 此处的脚本将会在插件管理器加载插件期间被加载
 * 一般情况下只需要从这个入口点进行开发即可满足绝大部分需求
 */

import { Container } from "react-dom";
import { NCMPlugin } from "plugin";
import { useForceUpdate, useLocalStorage } from "./hooks";
import "./index.scss";
import Button from "@mui/material/Button";
import { createHookFn } from "./utils";
import * as ReactDOM from "react-dom";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    AccordionSummary,
    Typography,
    AccordionDetails,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Switch,
} from "@mui/material";
import { useEffect, useState } from "react";

let configElement;
let self: NCMPlugin;
export const CONFIG = {
    debug: true,
};

if (CONFIG.debug) {
    channel.viewCall().map((v) => {
        const [namespace, fn] = v.split(".");
        if (namespace.includes("audio") || namespace.includes("player"))
            legacyNativeCmder.appendRegisterCall(
                fn.slice(2),
                namespace,
                (...args) => {
                    console.log(v, ...args);
                },
            );
        else
            legacyNativeCmder.appendRegisterCall(
                fn.slice(2),
                namespace,
                (...args) => {
                    console.debug(v, ...args);
                },
            );
    });
}

const playerElement = document.createElement("div");
document.body.appendChild(playerElement);

const hookedNativeCallFunction = createHookFn(channel.call, [
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

        if (path) {
            self.info.url = `(local) ${path}`;
            betterncm.fs.readFile(path).then((file) => {
                self.dispatchEvent(
                    new CustomEvent("updateCurrentAudioPlayer", {
                        detail: new Audio(URL.createObjectURL(file)),
                    }),
                );
            });
        } else {
            self.info.url = `(online) ${musicurl}`;
            self.dispatchEvent(
                new CustomEvent("updateCurrentAudioPlayer", {
                    detail: new Audio(musicurl),
                }),
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

            triggetRegisteredCallback(
                "audioplayer.onSeek",
                self.currentAudioId[0],
                `${self.currentAudioId[0]}|seek|${Math.random()}`,
                0,
                self.currentAudioPlayer.currentTime,
            );

            callback();
            return { cancel: true };
        }
    },
]);

plugin.onLoad(function (selfPlugin) {
    self = this.mainPlugin;
    self.info = {};
    self.playedTime = 0;

    configElement = document.createElement("div");
    ReactDOM.render(<PluginMenu />, configElement);

    self.addEventListener("updateCurrentAudioPlayer", (event: CustomEvent) => {
        if (self.currentAudioPlayer) {
            self.currentAudioPlayer.pause();
            self.currentAudioPlayer.remove();
        }
        self.currentAudioPlayer = event.detail as typeof Audio;

        self.currentAudioPlayer.addEventListener("timeupdate", (e) => {
            const loadProgress =
                self.currentAudioPlayer.buffered.end(0) /
                self.currentAudioPlayer.duration;

            self.info.playProgress = self.currentAudioPlayer.currentTime;
            self.info.loadProgress = loadProgress;

            triggetRegisteredCallback(
                "audioplayer.onPlayProgress",
                self.currentAudioId[0],
                self.currentAudioPlayer.currentTime,
                loadProgress,
            );
        });

        self.currentAudioPlayer.addEventListener("play", (e) => {
            self.info.playState = 1;
            self.info.lastPlayStartTime = performance.now();

            triggetRegisteredCallback(
                "audioplayer.onPlayState",
                self.currentAudioId[0],
                self.currentAudioId[1],
                1,
            );
        });

        self.currentAudioPlayer.addEventListener("ended", (e) => {
            self.playedTime += performance.now() - self.info.lastPlayStartTime;

            triggetRegisteredCallback(
                "audioplayer.onEnd",
                self.currentAudioId[0],
                {
                    activeCode: 0,
                    code: 0,
                    errorCode: 0,
                    errorString: "",
                    playedTime: self.playedTime,
                },
            );

            triggetRegisteredCallback(
                "audioplayer.onPlayProgress",
                self.currentAudioId[0],
                0,
                0,
            );

            self.playedTime = 0;
            self.info.playedTime = self.playedTime;
        });

        self.currentAudioPlayer.addEventListener("pause", (e) => {
            self.info.playState = 2;

            self.playedTime += performance.now() - self.info.lastPlayStartTime;
            self.info.playedTime = self.playedTime;

            triggetRegisteredCallback(
                "audioplayer.onPlayState",
                self.currentAudioId[0],
                self.currentAudioId[1],
                2,
            );
        });

        self.currentAudioPlayer.addEventListener("canplay", (e) => {
            triggetRegisteredCallback(
                "audioplayer.onPlayProgress",
                self.currentAudioId[0],
                0,
                0,
            );

            self.info.duration = self.currentAudioPlayer.duration;
            self.info.currentAudioId = self.currentAudioId.join(",");

            triggetRegisteredCallback(
                "audioplayer.onLoad",
                self.currentAudioId[0],
                {
                    activeCode: 0,
                    code: 0,
                    duration: self.currentAudioPlayer.duration,
                    errorCode: 0,
                    errorString: "",
                },
            );
        });

        self.currentAudioPlayer.addEventListener("error", (e) => {
            self.info.lastError = e.currentTarget.error.code;
        });
    });
});

function triggetRegisteredCallback(name, ...args) {
    registeredCalls[name].map((fn) => fn(...args));

    const [namespace, fn] = name.split(".");
    legacyNativeCmder.triggerRegisterCall(fn.slice(2), namespace, ...args);
}

function PluginMenu() {
    const [rows, setRows] = useState([
        {
            name: "无",
            value: "无",
        },
    ]);

    const [enabled, setEnabled] = useLocalStorage(
        "libfrontendplay.enabled",
        true,
    );
    const [disableNCMCache, setDisableNCMCache] = useLocalStorage(
        "libfrontendplay.disableNCMCache",
        true,
    );

    useEffect(() => {
        if (enabled) {
            channel.call("audioplayer.pause", () => {}, ["", ""]);
            channel.call = hookedNativeCallFunction.function;
        } else {
            self.dispatchEvent(
                new CustomEvent("updateCurrentAudioPlayer", {
                    detail: new Audio(),
                }),
            );
            channel.call = hookedNativeCallFunction.origin;
        }
    }, [enabled]);

    useEffect(() => {
        if (disableNCMCache) {
            channel.call("storage.init", (...v) => console.log(v), [
                "",
                "0",
                "",
            ]);
            channel.call("storage.clearCache", (...v) => console.log(v), []);
        } else {
            channel.call("storage.init", (...v) => console.log(v), [
                "",
                "1",
                "",
            ]);
        }
    }, [disableNCMCache]);

    useEffect(() => {
        setInterval(() => {
            setRows(
                Object.entries(self.info).map(([name, value]) => ({
                    name,
                    value: value as string,
                })),
            );
        }, 200);
    }, []);

    return (
        <>
            <div>
                <Switch
                    name="启用"
                    checked={enabled}
                    onChange={(e, checked) => setEnabled(checked)}
                />
                <span>启用</span>

                <Switch
                    name="禁用NCM缓存"
                    checked={disableNCMCache}
                    onChange={(e, checked) => setDisableNCMCache(checked)}
                />
                <span>禁用NCM缓存</span>
            </div>
            <div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 250 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>类型</TableCell>
                                <TableCell align="right">值</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.value.length > 30 ? (
                                            <TextField
                                                id="standard-basic"
                                                variant="standard"
                                                value={row.value}
                                            />
                                        ) : (
                                            row.value
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
}

plugin.onConfig(() => {
    return configElement;
});
