export function createHookFn(
	fn: Function,
	prefixs?: Function | Function[],
	postfixs?: Function | Function[],
): Function {
	return function (...args) {
		if (prefixs instanceof Function) prefixs = [prefixs];
		if (postfixs instanceof Function) postfixs = [postfixs];

		let prefixResult = {
			cancel: false,
		};

		for (const prefix of prefixs ?? []) {
			prefixResult = prefix(...args);
			if(prefixResult.cancel)return;
		}

		let result;
		if (!prefixResult.cancel) result = fn.apply(this, args);

		for (const postfix of postfixs ?? []) {
			result = postfix?.apply(result, ...args) ?? result;
		}

		return result;
	};
}
