/**
 * 创建钩子函数，用于拦截和修改原有函数调用
 * @param fn 原函数
 * @param prefixs 前置处理函数（返回 {cancel: true} 可拦截）
 * @param postfixs 后置处理函数
 */
export function createHookFn(
    fn: Function,
    prefixs?: Function | Function[],
    postfixs?: Function | Function[],
): { function: Function; origin: Function } {
    return {
        function: function (...args) {
            if (prefixs instanceof Function) prefixs = [prefixs];
            if (postfixs instanceof Function) postfixs = [postfixs];

            let prefixResult = {
                cancel: false,
                args: undefined,
                skip: false
            };

            let callArgs;

            for (const prefix of prefixs ?? []) {
                prefixResult = prefix(...args);
                if (prefixResult?.cancel) return;
                if (prefixResult?.args)
                    callArgs = callArgs ?? prefixResult?.args;
                if (prefixResult?.skip) break;
            }
            
            let result;
            result = fn.apply(this, callArgs ?? args);

            for (const postfix of postfixs ?? []) {
                result = postfix?.apply(result, args) ?? result;
            }

            return result;
        },
        origin: fn,
    };
}
