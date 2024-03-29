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
    Alert,
    AlertTitle,
    Stack,
    Slider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { checkHijack } from "./hijack_checker";

interface LFPNCMPlugin extends NCMPlugin {
    currentAudioPlayer: HTMLAudioElement;
    volume: HTMLAudioElement["volume"];
    currentAudioId: [string, string];
    playedTime: number;
    enabled: boolean;
    currentAudioContext: AudioContext,
    currentAudioSource: MediaElementAudioSourceNode,
    info: {
        playState: number;
        lastPlayStartTime: number;
        playedTime: number;
        duration: number;
        playProgress: number;
        loadProgress: number;
        currentAudioId: string;
        url: string;
        lastError: number | undefined;
    };
}

let configElement;
let self: LFPNCMPlugin;

if (localStorage["libfrontendplay.debug"] === "true") {
    channel.viewCall().map((v) => {
        const [namespace, fn] = v.split(".");
        if (fn.includes("PlayProgress")) return;
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
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    (name: string, callback: Function, [audioId, audioInfo]: any[]) => {
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

        self.temporaryDisabled = false;

        if (localStorage["libfrontendplay.disableNCMCache"])
            channel.call("storage.clearCache", (...v) => console.log("Clear cache", v), [""]);

        if (path) {
            self.info.url = `(local) ${path}`;
            if (path.endsWith(".ncm")) {
                self.temporaryDisabled = true;
                self.info.url = `(local-disabled) ${path}`;
                self.currentAudioPlayer?.pause();

                self.dispatchEvent(
                    new CustomEvent("updateCurrentAudioPlayer", {
                        detail: new Audio(),
                    }),
                );

                return { skip: true };
            }

            betterncm.fs.mountFile(path).then((url) => {
                self.dispatchEvent(
                    new CustomEvent("updateCurrentAudioPlayer", {
                        detail: new Audio(url),
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
    (name) => {
        if (name !== "audioplayer.load")
            if (self.temporaryDisabled) return { skip: true };
    },
    (name, callback, args) => {
        if (name === "audioplayer.setVolume") {
            if (self.currentAudioPlayer) {
                self.currentAudioPlayer.volume = args[2];
                self.volume = args[2];
            }
            callback(true);

            triggerRegisteredCallback(
                "audioplayer.onVolume",
                self.currentAudioId[0],
                "",
                0,
                args[2],
            );

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

            triggerRegisteredCallback(
                "audioplayer.onSeek",
                ...args,
                0,
                args[2],
            );

            return { cancel: true };
        }
    },
]);

plugin.onLoad(function (selfPlugin) {

    const style = document.createElement("style");
    style.innerHTML = `
.n-setcnt .normal.u-cklist{
    position: relative;
}
.n-setcnt .normal.u-cklist::after {
    position: absolute;
    content:"已被 LibFrontendPlay 禁用";
    font-size: 30px;
    font-weight: 700;
    background:#ffffff29;
    left: -10px;
    right: 0px;
    height: 55%;
    bottom: -20px;
    border: 1px solid #bbbbbb24;
    border-radius: 10px;
    backdrop-filter: brightness(0.3);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}
`;
    document.head.appendChild(style);

    (betterncm_native as any).audio = {
        getFFTData() { return [] },
        acquireFFTData() { },
        releaseFFTData() { }
    }

    self = this.mainPlugin;
    self.info = {
        playState: 2,
        lastPlayStartTime: 0,
        playedTime: 0,
        duration: 0,
        playProgress: 0,
        loadProgress: 0,
        url: "",
        currentAudioId: "",
        lastError: undefined,
    };
    self.currentAudioId = ["", ""];
    self.playedTime = 0;
    self.volume = 0;
    self.enabled = true;
    self.temporaryDisabled = false;

    try {
        const nmSettingPlayer = JSON.parse(
            localStorage.getItem("NM_SETTING_PLAYER") || "{}",
        );
        self.volume = nmSettingPlayer?.volume ?? 0.5;
    } catch { }

    configElement = document.createElement("div");
    ReactDOM.render(<PluginMenu />, configElement);

    self.addEventListener("updateCurrentAudioPlayer", (event: CustomEvent) => {
        if (self.currentAudioPlayer) {
            self.currentAudioPlayer.pause();
            self.currentAudioPlayer.remove();
        }
        self.currentAudioPlayer = event.detail as HTMLAudioElement;
        self.currentAudioPlayer.preload = "auto"
        self.currentAudioPlayer.volume = self.volume ?? 0.5;

        self.currentAudioContext = new AudioContext();
        self.currentAudioAnalyser = self.currentAudioContext.createAnalyser();
        self.currentAudioSource = self.currentAudioContext.createMediaElementSource(self.currentAudioPlayer);
        self.currentAudioAnalyser.connect(self.currentAudioContext.destination);
        self.currentAudioSource.connect(self.currentAudioAnalyser);

        self.getFFTData = () => {
            const data = new Uint8Array(self.currentAudioAnalyser.frequencyBinCount);
            self.currentAudioAnalyser.getByteFrequencyData(data);
            return data;
        }

        // polyfills for amll
        (betterncm_native as any).audio = {
            getFFTData: self.getFFTData,
            acquireFFTData() { },
            releaseFFTData() { }
        };
        (betterncm as any).isMRBNCM = true;

        self.dispatchEvent(new CustomEvent("audioSourceUpdated", { detail: self.currentAudioSource }))

        self.currentAudioPlayer.addEventListener("play", (e) => {
            self.info.playState = 1;
            self.info.lastPlayStartTime = performance.now();

            triggerRegisteredCallback(
                "audioplayer.onPlayState",
                self.currentAudioId[0],
                self.currentAudioId[1].replace(/\|(\S+)\|/, `|resume|`),
                1,
            );
        });

        self.currentAudioPlayer.addEventListener("ended", (e) => {
            self.playedTime += performance.now() - self.info.lastPlayStartTime;

            triggerRegisteredCallback(
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

            triggerRegisteredCallback(
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

            triggerRegisteredCallback(
                "audioplayer.onPlayState",
                self.currentAudioId[0],
                self.currentAudioId[1].replace(/\|(\S+)\|/, `|pause|`),
                2,
            );
        });

        self.currentAudioPlayer.addEventListener("canplay", (e) => {
            triggerRegisteredCallback(
                "audioplayer.onPlayProgress",
                self.currentAudioId[0],
                0,
                0,
            );

            self.info.duration = self.currentAudioPlayer.duration;
            self.info.currentAudioId = self.currentAudioId.join(",");

            self.currentAudioPlayer.play();
        });

        self.currentAudioPlayer.addEventListener("loadedmetadata", (e) => {
            triggerRegisteredCallback(
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
            self.info.lastError = (
                e.currentTarget as HTMLAudioElement
            ).error?.code;
        });
    });

    checkHijack();
});

function triggerRegisteredCallback(name, ...args) {
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
    const [disableNCMLocalFile, setDisableNCMLocalFile] = useLocalStorage(
        "libfrontendplay.disableNCMLocalFile",
        true,
    );



    const [progressCallbackInterval, setProgressCallbackInterval] =
        useLocalStorage("libfrontendplay.progressCallbackInterval", 100);

    useEffect(() => {
        if (self.progressCallbackIntervalHandler)
            clearInterval(self.progressCallbackIntervalHandler);
        self.progressCallbackIntervalHandler = setInterval(
            updatePlayProgress,
            progressCallbackInterval,
        );
    }, [progressCallbackInterval]);

    useEffect(() => {
        if (enabled) {
            channel.call("audioplayer.pause", () => { }, ["", ""]);
            channel.call = hookedNativeCallFunction.function;
            self.enabled = true;
            self.dispatchEvent(
                new CustomEvent("pluginEnabled", {
                    detail: new Audio(),
                }),
            );
        } else {
            self.dispatchEvent(
                new CustomEvent("updateCurrentAudioPlayer", {
                    detail: new Audio(),
                }),
            );
            self.enabled = false;
            self.dispatchEvent(
                new CustomEvent("pluginDisabled", {
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
            channel.call("storage.clearCache", (...v) => console.log(v), [""]);
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
            <Stack spacing={2}>
                {enabled && (
                    <Alert severity="warning">
                        <AlertTitle>注意</AlertTitle>
                        网易云自带桌面歌词将<strong>不可用</strong>
                    </Alert>
                )}

                {enabled && !disableNCMCache && (
                    <Alert severity="warning">
                        <AlertTitle>注意</AlertTitle>
                        启用网易云音乐缓存可能会导致
                        <strong>部分VIP歌曲播放失败</strong>
                    </Alert>
                )}

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
                    <span>禁用 NCM 缓存</span>

                    <Switch
                        name="禁止读取本地 .ncm 文件"
                        checked={true}
                        disabled={true}
                    // onChange={(e, checked) => setDisableNCMLocalFile(checked)}
                    />
                    <span>禁止读取本地 .ncm 文件</span>
                </div>

                {enabled && (
                    <Stack
                        spacing={2}
                        direction="row"
                        sx={{ mb: 1 }}
                        alignItems="center"
                    >
                        <div style={{ minWidth: "6em" }}>进度回调间隔</div>
                        <Slider
                            max={500}
                            min={20}
                            step={10}
                            size="medium"
                            valueLabelDisplay="auto"
                            value={progressCallbackInterval}
                            onChange={(e, v) => {
                                setProgressCallbackInterval(v as number);
                            }}
                        />
                    </Stack>
                )}

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
                                            "&:last-child td, &:last-child th":
                                            {
                                                border: 0,
                                            },
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.value &&
                                                row.value.length > 30 ? (
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
            </Stack>
        </>
    );
}

plugin.onConfig(() => {
    return configElement;
});
function updatePlayProgress() {
    if (!self.currentAudioPlayer) return;
    if (!self.enabled) return;
    if (self.currentAudioPlayer.buffered.length === 0) return;

    const loadProgress =
        self.currentAudioPlayer.buffered.end(0) /
        self.currentAudioPlayer.duration;
    if (self.info.playProgress !== self.currentAudioPlayer.currentTime) {
        self.info.playProgress = self.currentAudioPlayer.currentTime;
        self.info.loadProgress = loadProgress;



        triggerRegisteredCallback(
            "audioplayer.onPlayProgress",
            self.currentAudioId[0],
            self.currentAudioPlayer.currentTime,
            loadProgress,
        );
    }
}
