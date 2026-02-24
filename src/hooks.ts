import * as React from "react";

/**
 * 本地存储钩子
 * @param key 存储键名
 * @param initialValue 初始值
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, (value: T | ((prevValue: T) => T)) => void] {
    const [storedValue, setStoredValue] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value: T | ((prevValue: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // 忽略写入错误
        }
    };

    return [storedValue, setValue];
}
