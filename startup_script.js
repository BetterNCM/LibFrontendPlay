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
  if (true) {
    channel.call = createHookFn(channel.call, (name, callback, args) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3V0aWxzLnRzIiwgInNyYy9zdGFydHVwX3NjcmlwdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvb2tGbihcclxuXHRmbjogRnVuY3Rpb24sXHJcblx0cHJlZml4cz86IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSxcclxuXHRwb3N0Zml4cz86IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSxcclxuKTogeyBmdW5jdGlvbjogRnVuY3Rpb247IG9yaWdpbjogRnVuY3Rpb24gfSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdGZ1bmN0aW9uOiBmdW5jdGlvbiAoLi4uYXJncykge1xyXG5cdFx0XHRpZiAocHJlZml4cyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBwcmVmaXhzID0gW3ByZWZpeHNdO1xyXG5cdFx0XHRpZiAocG9zdGZpeHMgaW5zdGFuY2VvZiBGdW5jdGlvbikgcG9zdGZpeHMgPSBbcG9zdGZpeHNdO1xyXG5cclxuXHRcdFx0bGV0IHByZWZpeFJlc3VsdCA9IHtcclxuXHRcdFx0XHRjYW5jZWw6IGZhbHNlLFxyXG5cdFx0XHRcdGFyZ3M6IHVuZGVmaW5lZFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0bGV0IGNhbGxBcmdzO1xyXG5cclxuXHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgcHJlZml4cyA/PyBbXSkge1xyXG5cdFx0XHRcdHByZWZpeFJlc3VsdCA9IHByZWZpeCguLi5hcmdzKTtcclxuXHRcdFx0XHRpZiAocHJlZml4UmVzdWx0Py5jYW5jZWwpIHJldHVybjtcclxuXHRcdFx0XHRpZiAocHJlZml4UmVzdWx0Py5hcmdzKSBjYWxsQXJncyA9IGNhbGxBcmdzID8/IHByZWZpeFJlc3VsdD8uYXJncztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoY2FsbEFyZ3MpIGNvbnNvbGUubG9nKGNhbGxBcmdzLCBhcmdzKVxyXG5cdFx0XHRsZXQgcmVzdWx0O1xyXG5cdFx0XHRyZXN1bHQgPSBmbi5hcHBseSh0aGlzLCBjYWxsQXJncyA/PyBhcmdzKTtcclxuXHJcblx0XHRcdGZvciAoY29uc3QgcG9zdGZpeCBvZiBwb3N0Zml4cyA/PyBbXSkge1xyXG5cdFx0XHRcdHJlc3VsdCA9IHBvc3RmaXg/LmFwcGx5KHJlc3VsdCwgYXJncykgPz8gcmVzdWx0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSxcclxuXHRcdG9yaWdpbjogZm5cclxuXHR9O1xyXG59XHJcbiIsICIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiBcdTZCNjRcdTU5MDRcdTc2ODRcdTgxMUFcdTY3MkNcdTVDMDZcdTU3MjhcdTdGNTFcdTY2MTNcdTRFOTFcdTc2ODRcdTdBOTdcdTUzRTNcdTUzQ0FcdTZENEZcdTg5QzhcdTU2NjhcdTk4NzVcdTk3NjJcdTUyMURcdTU5Q0JcdTUzMTZcdTY1RjZcdTg4QUJcdThDMDNcdTc1MjhcclxuICogXHU2NjJGXHU2NzAwXHU1MTQ4XHU1RjAwXHU1OUNCXHU2MjY3XHU4ODRDXHU3Njg0XHU4MTFBXHU2NzJDXHJcbiAqIFx1NjI0MFx1NEVFNVx1NEUwRFx1NUI1OFx1NTcyOFx1NEVGQlx1NEY1NVx1NjNEMlx1NEVGNlx1NEY5RFx1OEQ1Nlx1NTQ4QyBCZXR0ZXJOQ00gQVBJXHJcbiAqIFx1NTk4Mlx1Njc5Q1x1NEY2MFx1NzY4NFx1NjNEMlx1NEVGNlx1NTNFRlx1NEVFNVx1NTcyOFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1NTJBMFx1OEY3RFx1NEY2MFx1NzY4NFx1NjNEMlx1NEVGNlx1NjcxRlx1OTVGNFx1NUI4Q1x1NjIxMFx1OTcwMFx1ODk4MVx1NzY4NFx1NjRDRFx1NEY1Q1xyXG4gKiBcdThCRjdcdTVDM0RcdTkxQ0ZcdTRFMERcdTg5ODFcdTRGN0ZcdTc1MjhcdTY3MkNcdTgxMUFcdTY3MkNcdTY3NjVcdTUyQTBcdThGN0RcdTRFMUNcdTg5N0ZcdUZGMENcdTU0MjZcdTUyMTlcdTRGMUFcdTU5MjdcdTVFNDVcdTVFQTZcdTVGNzFcdTU0Q0RcdTUyQTBcdThGN0RcdTkwMUZcdTVFQTZcclxuICogXHU1NDBDXHU2NUY2XHU0RTVGXHU0RTBEXHU4OTgxXHU1QzFEXHU4QkQ1XHU0RkI1XHU1MTY1XHU2MDI3XHU1OTI3XHU3Njg0XHU2NENEXHU0RjVDXHVGRjBDXHU5MDdGXHU1MTREXHU3RjUxXHU2NjEzXHU0RTkxXHU1RDI5XHU2RTgzXHU3NTFBXHU4MUYzXHU2NUUwXHU2Q0Q1XHU2MjUzXHU1RjAwXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ09ORklHIH0gZnJvbSBcIi5cIjtcclxuaW1wb3J0IHsgY3JlYXRlSG9va0ZuIH0gZnJvbSBcIi4vdXRpbHNcIjtcclxuXHJcbnZhciByZWdpc3RlcmVkQ2FsbHMgPSB7fTtcclxud2luZG93W1wicmVnaXN0ZXJlZENhbGxzXCJdID0gcmVnaXN0ZXJlZENhbGxzO1xyXG5jaGFubmVsLnJlZ2lzdGVyQ2FsbCA9IGNyZWF0ZUhvb2tGbihjaGFubmVsLnJlZ2lzdGVyQ2FsbCwgKGtleSwgZm4pID0+IHtcclxuICAgIHJlZ2lzdGVyZWRDYWxsc1trZXldID8/PSBbXVxyXG4gICAgcmVnaXN0ZXJlZENhbGxzW2tleV0ucHVzaChmbik7XHJcbn0pLmZ1bmN0aW9uO1xyXG5cclxuaWYgKHRydWUpIHtcclxuICAgIGNoYW5uZWwuY2FsbCA9IGNyZWF0ZUhvb2tGbihjaGFubmVsLmNhbGwsIChuYW1lLCBjYWxsYmFjaywgYXJncykgPT4ge1xyXG4gICAgICAgIGlmIChuYW1lLmluY2x1ZGVzKFwiYXVkaW9cIikgfHwgbmFtZS5pbmNsdWRlcyhcInBsYXllclwiKSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmFtZSwgY2FsbGJhY2ssIGFyZ3MpO1xyXG4gICAgICAgIGVsc2UgY29uc29sZS5kZWJ1ZyhuYW1lLCBjYWxsYmFjaywgYXJncyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVIb29rRm4oY2FsbGJhY2ssICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUuaW5jbHVkZXMoXCJhdWRpb1wiKSB8fCBuYW1lLmluY2x1ZGVzKFwicGxheWVyXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltDYWxsYmFja11cIiwgbmFtZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjb25zb2xlLmRlYnVnKFwiW0NhbGxiYWNrXVwiLCBuYW1lLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgIH0pLmZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgYXJncyxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9O1xyXG4gICAgfSkuZnVuY3Rpb247XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOztBQUFPLFdBQVMsYUFDZixJQUNBLFNBQ0EsVUFDMkM7QUFDM0MsV0FBTztBQUFBLE1BQ04sVUFBVSxZQUFhLE1BQU07QUFDNUIsWUFBSSxtQkFBbUI7QUFBVSxvQkFBVSxDQUFDLE9BQU87QUFDbkQsWUFBSSxvQkFBb0I7QUFBVSxxQkFBVyxDQUFDLFFBQVE7QUFFdEQsWUFBSSxlQUFlO0FBQUEsVUFDbEIsUUFBUTtBQUFBLFVBQ1IsTUFBTTtBQUFBLFFBQ1A7QUFFQSxZQUFJO0FBRUosbUJBQVcsVUFBVSxXQUFXLENBQUMsR0FBRztBQUNuQyx5QkFBZSxPQUFPLEdBQUcsSUFBSTtBQUM3QixjQUFJLGNBQWM7QUFBUTtBQUMxQixjQUFJLGNBQWM7QUFBTSx1QkFBVyxZQUFZLGNBQWM7QUFBQSxRQUM5RDtBQUNBLFlBQUk7QUFBVSxrQkFBUSxJQUFJLFVBQVUsSUFBSTtBQUN4QyxZQUFJO0FBQ0osaUJBQVMsR0FBRyxNQUFNLE1BQU0sWUFBWSxJQUFJO0FBRXhDLG1CQUFXLFdBQVcsWUFBWSxDQUFDLEdBQUc7QUFDckMsbUJBQVMsU0FBUyxNQUFNLFFBQVEsSUFBSSxLQUFLO0FBQUEsUUFDMUM7QUFFQSxlQUFPO0FBQUEsTUFDUjtBQUFBLE1BQ0EsUUFBUTtBQUFBLElBQ1Q7QUFBQSxFQUNEOzs7QUNyQkEsTUFBSSxrQkFBa0IsQ0FBQztBQUN2QixTQUFPLGlCQUFpQixJQUFJO0FBQzVCLFVBQVEsZUFBZSxhQUFhLFFBQVEsY0FBYyxDQUFDLEtBQUssT0FBTztBQUNuRSxvQkFBZ0IsR0FBRyxNQUFNLENBQUM7QUFDMUIsb0JBQWdCLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFBQSxFQUNoQyxDQUFDLEVBQUU7QUFFSCxNQUFJLE1BQU07QUFDTixZQUFRLE9BQU8sYUFBYSxRQUFRLE1BQU0sQ0FBQyxNQUFNLFVBQVUsU0FBUztBQUNoRSxVQUFJLEtBQUssU0FBUyxPQUFPLEtBQUssS0FBSyxTQUFTLFFBQVE7QUFDaEQsZ0JBQVEsSUFBSSxNQUFNLFVBQVUsSUFBSTtBQUFBO0FBQy9CLGdCQUFRLE1BQU0sTUFBTSxVQUFVLElBQUk7QUFFdkMsYUFBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGFBQWEsVUFBVSxJQUFJQSxVQUFTO0FBQ2hDLGdCQUFJLEtBQUssU0FBUyxPQUFPLEtBQUssS0FBSyxTQUFTLFFBQVE7QUFDaEQsc0JBQVEsSUFBSSxjQUFjLE1BQU1BLEtBQUk7QUFBQTtBQUNuQyxzQkFBUSxNQUFNLGNBQWMsTUFBTUEsS0FBSTtBQUFBLFVBQy9DLENBQUMsRUFBRTtBQUFBLFVBQ0g7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQyxFQUFFO0FBQUEsRUFDUDsiLAogICJuYW1lcyI6IFsiYXJncyJdCn0K
