(() => {
  // src/utils.ts
  function createHookFn(fn, prefixs, postfixs) {
    return {
      function: function(...args) {
        if (prefixs instanceof Function)
          prefixs = [prefixs];
        if (postfixs instanceof Function)
          postfixs = [postfixs];
        let prefixResult = {
          cancel: false,
          args: void 0
        };
        let callArgs;
        for (const prefix of prefixs ?? []) {
          prefixResult = prefix(...args);
          if (prefixResult?.cancel)
            return;
          if (prefixResult?.args)
            callArgs = callArgs ?? prefixResult?.args;
        }
        if (callArgs)
          console.log(callArgs, args);
        let result;
        result = fn.apply(this, callArgs ?? args);
        for (const postfix of postfixs ?? []) {
          result = postfix?.apply(result, args) ?? result;
        }
        return result;
      },
      origin: fn
    };
  }

  // src/startup_script.ts
  var registeredCalls = {};
  window["registeredCalls"] = registeredCalls;
  channel.registerCall = createHookFn(channel.registerCall, (key, fn) => {
    registeredCalls[key] ??= [];
    registeredCalls[key].push(fn);
  }).function;
  if (localStorage["libfrontendplay.debug"] === "true") {
    channel.call = createHookFn(channel.call, (name, callback, args) => {
      if (name === "audioplayer.onPlayProgress")
        return;
      if (name.includes("audio") || name.includes("player"))
        console.log(name, callback, args);
      else
        console.debug(name, callback, args);
      return {
        args: [
          name,
          createHookFn(callback, (...args2) => {
            if (name.includes("audio") || name.includes("player"))
              console.log("[Callback]", name, args2);
            else
              console.debug("[Callback]", name, args2);
          }).function,
          args
        ]
      };
    }).function;
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3V0aWxzLnRzIiwgInNyYy9zdGFydHVwX3NjcmlwdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvb2tGbihcclxuXHRmbjogRnVuY3Rpb24sXHJcblx0cHJlZml4cz86IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSxcclxuXHRwb3N0Zml4cz86IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSxcclxuKTogeyBmdW5jdGlvbjogRnVuY3Rpb247IG9yaWdpbjogRnVuY3Rpb24gfSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdGZ1bmN0aW9uOiBmdW5jdGlvbiAoLi4uYXJncykge1xyXG5cdFx0XHRpZiAocHJlZml4cyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBwcmVmaXhzID0gW3ByZWZpeHNdO1xyXG5cdFx0XHRpZiAocG9zdGZpeHMgaW5zdGFuY2VvZiBGdW5jdGlvbikgcG9zdGZpeHMgPSBbcG9zdGZpeHNdO1xyXG5cclxuXHRcdFx0bGV0IHByZWZpeFJlc3VsdCA9IHtcclxuXHRcdFx0XHRjYW5jZWw6IGZhbHNlLFxyXG5cdFx0XHRcdGFyZ3M6IHVuZGVmaW5lZFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0bGV0IGNhbGxBcmdzO1xyXG5cclxuXHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgcHJlZml4cyA/PyBbXSkge1xyXG5cdFx0XHRcdHByZWZpeFJlc3VsdCA9IHByZWZpeCguLi5hcmdzKTtcclxuXHRcdFx0XHRpZiAocHJlZml4UmVzdWx0Py5jYW5jZWwpIHJldHVybjtcclxuXHRcdFx0XHRpZiAocHJlZml4UmVzdWx0Py5hcmdzKSBjYWxsQXJncyA9IGNhbGxBcmdzID8/IHByZWZpeFJlc3VsdD8uYXJncztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoY2FsbEFyZ3MpIGNvbnNvbGUubG9nKGNhbGxBcmdzLCBhcmdzKVxyXG5cdFx0XHRsZXQgcmVzdWx0O1xyXG5cdFx0XHRyZXN1bHQgPSBmbi5hcHBseSh0aGlzLCBjYWxsQXJncyA/PyBhcmdzKTtcclxuXHJcblx0XHRcdGZvciAoY29uc3QgcG9zdGZpeCBvZiBwb3N0Zml4cyA/PyBbXSkge1xyXG5cdFx0XHRcdHJlc3VsdCA9IHBvc3RmaXg/LmFwcGx5KHJlc3VsdCwgYXJncykgPz8gcmVzdWx0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSxcclxuXHRcdG9yaWdpbjogZm5cclxuXHR9O1xyXG59XHJcbiIsICIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiBcdTZCNjRcdTU5MDRcdTc2ODRcdTgxMUFcdTY3MkNcdTVDMDZcdTU3MjhcdTdGNTFcdTY2MTNcdTRFOTFcdTc2ODRcdTdBOTdcdTUzRTNcdTUzQ0FcdTZENEZcdTg5QzhcdTU2NjhcdTk4NzVcdTk3NjJcdTUyMURcdTU5Q0JcdTUzMTZcdTY1RjZcdTg4QUJcdThDMDNcdTc1MjhcclxuICogXHU2NjJGXHU2NzAwXHU1MTQ4XHU1RjAwXHU1OUNCXHU2MjY3XHU4ODRDXHU3Njg0XHU4MTFBXHU2NzJDXHJcbiAqIFx1NjI0MFx1NEVFNVx1NEUwRFx1NUI1OFx1NTcyOFx1NEVGQlx1NEY1NVx1NjNEMlx1NEVGNlx1NEY5RFx1OEQ1Nlx1NTQ4QyBCZXR0ZXJOQ00gQVBJXHJcbiAqIFx1NTk4Mlx1Njc5Q1x1NEY2MFx1NzY4NFx1NjNEMlx1NEVGNlx1NTNFRlx1NEVFNVx1NTcyOFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1NTJBMFx1OEY3RFx1NEY2MFx1NzY4NFx1NjNEMlx1NEVGNlx1NjcxRlx1OTVGNFx1NUI4Q1x1NjIxMFx1OTcwMFx1ODk4MVx1NzY4NFx1NjRDRFx1NEY1Q1xyXG4gKiBcdThCRjdcdTVDM0RcdTkxQ0ZcdTRFMERcdTg5ODFcdTRGN0ZcdTc1MjhcdTY3MkNcdTgxMUFcdTY3MkNcdTY3NjVcdTUyQTBcdThGN0RcdTRFMUNcdTg5N0ZcdUZGMENcdTU0MjZcdTUyMTlcdTRGMUFcdTU5MjdcdTVFNDVcdTVFQTZcdTVGNzFcdTU0Q0RcdTUyQTBcdThGN0RcdTkwMUZcdTVFQTZcclxuICogXHU1NDBDXHU2NUY2XHU0RTVGXHU0RTBEXHU4OTgxXHU1QzFEXHU4QkQ1XHU0RkI1XHU1MTY1XHU2MDI3XHU1OTI3XHU3Njg0XHU2NENEXHU0RjVDXHVGRjBDXHU5MDdGXHU1MTREXHU3RjUxXHU2NjEzXHU0RTkxXHU1RDI5XHU2RTgzXHU3NTFBXHU4MUYzXHU2NUUwXHU2Q0Q1XHU2MjUzXHU1RjAwXHJcbiAqL1xyXG5pbXBvcnQgeyBjcmVhdGVIb29rRm4gfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5cclxudmFyIHJlZ2lzdGVyZWRDYWxscyA9IHt9O1xyXG53aW5kb3dbXCJyZWdpc3RlcmVkQ2FsbHNcIl0gPSByZWdpc3RlcmVkQ2FsbHM7XHJcbmNoYW5uZWwucmVnaXN0ZXJDYWxsID0gY3JlYXRlSG9va0ZuKGNoYW5uZWwucmVnaXN0ZXJDYWxsLCAoa2V5LCBmbikgPT4ge1xyXG4gICAgcmVnaXN0ZXJlZENhbGxzW2tleV0gPz89IFtdXHJcbiAgICByZWdpc3RlcmVkQ2FsbHNba2V5XS5wdXNoKGZuKTtcclxufSkuZnVuY3Rpb247XHJcblxyXG5pZiAobG9jYWxTdG9yYWdlW1wibGliZnJvbnRlbmRwbGF5LmRlYnVnXCJdPT09XCJ0cnVlXCIpIHtcclxuICAgIGNoYW5uZWwuY2FsbCA9IGNyZWF0ZUhvb2tGbihjaGFubmVsLmNhbGwsIChuYW1lLCBjYWxsYmFjaywgYXJncykgPT4ge1xyXG4gICAgICAgIGlmIChuYW1lID09PSBcImF1ZGlvcGxheWVyLm9uUGxheVByb2dyZXNzXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKG5hbWUuaW5jbHVkZXMoXCJhdWRpb1wiKSB8fCBuYW1lLmluY2x1ZGVzKFwicGxheWVyXCIpKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lLCBjYWxsYmFjaywgYXJncyk7XHJcbiAgICAgICAgZWxzZSBjb25zb2xlLmRlYnVnKG5hbWUsIGNhbGxiYWNrLCBhcmdzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgIGNyZWF0ZUhvb2tGbihjYWxsYmFjaywgKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZS5pbmNsdWRlcyhcImF1ZGlvXCIpIHx8IG5hbWUuaW5jbHVkZXMoXCJwbGF5ZXJcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0NhbGxiYWNrXVwiLCBuYW1lLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGNvbnNvbGUuZGVidWcoXCJbQ2FsbGJhY2tdXCIsIG5hbWUsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSkuZnVuY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBhcmdzLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH07XHJcbiAgICB9KS5mdW5jdGlvbjtcclxufSJdLAogICJtYXBwaW5ncyI6ICI7O0FBQU8sV0FBUyxhQUNmLElBQ0EsU0FDQSxVQUMyQztBQUMzQyxXQUFPO0FBQUEsTUFDTixVQUFVLFlBQWEsTUFBTTtBQUM1QixZQUFJLG1CQUFtQjtBQUFVLG9CQUFVLENBQUMsT0FBTztBQUNuRCxZQUFJLG9CQUFvQjtBQUFVLHFCQUFXLENBQUMsUUFBUTtBQUV0RCxZQUFJLGVBQWU7QUFBQSxVQUNsQixRQUFRO0FBQUEsVUFDUixNQUFNO0FBQUEsUUFDUDtBQUVBLFlBQUk7QUFFSixtQkFBVyxVQUFVLFdBQVcsQ0FBQyxHQUFHO0FBQ25DLHlCQUFlLE9BQU8sR0FBRyxJQUFJO0FBQzdCLGNBQUksY0FBYztBQUFRO0FBQzFCLGNBQUksY0FBYztBQUFNLHVCQUFXLFlBQVksY0FBYztBQUFBLFFBQzlEO0FBQ0EsWUFBSTtBQUFVLGtCQUFRLElBQUksVUFBVSxJQUFJO0FBQ3hDLFlBQUk7QUFDSixpQkFBUyxHQUFHLE1BQU0sTUFBTSxZQUFZLElBQUk7QUFFeEMsbUJBQVcsV0FBVyxZQUFZLENBQUMsR0FBRztBQUNyQyxtQkFBUyxTQUFTLE1BQU0sUUFBUSxJQUFJLEtBQUs7QUFBQSxRQUMxQztBQUVBLGVBQU87QUFBQSxNQUNSO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFDVDtBQUFBLEVBQ0Q7OztBQ3ZCQSxNQUFJLGtCQUFrQixDQUFDO0FBQ3ZCLFNBQU8saUJBQWlCLElBQUk7QUFDNUIsVUFBUSxlQUFlLGFBQWEsUUFBUSxjQUFjLENBQUMsS0FBSyxPQUFPO0FBQ25FLG9CQUFnQixHQUFHLE1BQU0sQ0FBQztBQUMxQixvQkFBZ0IsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ2hDLENBQUMsRUFBRTtBQUVILE1BQUksYUFBYSx1QkFBdUIsTUFBSSxRQUFRO0FBQ2hELFlBQVEsT0FBTyxhQUFhLFFBQVEsTUFBTSxDQUFDLE1BQU0sVUFBVSxTQUFTO0FBQ2hFLFVBQUksU0FBUztBQUE4QjtBQUUzQyxVQUFJLEtBQUssU0FBUyxPQUFPLEtBQUssS0FBSyxTQUFTLFFBQVE7QUFDaEQsZ0JBQVEsSUFBSSxNQUFNLFVBQVUsSUFBSTtBQUFBO0FBQy9CLGdCQUFRLE1BQU0sTUFBTSxVQUFVLElBQUk7QUFFdkMsYUFBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGFBQWEsVUFBVSxJQUFJQSxVQUFTO0FBQ2hDLGdCQUFJLEtBQUssU0FBUyxPQUFPLEtBQUssS0FBSyxTQUFTLFFBQVE7QUFDaEQsc0JBQVEsSUFBSSxjQUFjLE1BQU1BLEtBQUk7QUFBQTtBQUNuQyxzQkFBUSxNQUFNLGNBQWMsTUFBTUEsS0FBSTtBQUFBLFVBQy9DLENBQUMsRUFBRTtBQUFBLFVBQ0g7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQyxFQUFFO0FBQUEsRUFDUDsiLAogICJuYW1lcyI6IFsiYXJncyJdCn0K
