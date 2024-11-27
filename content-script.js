(() => {
  let premium_read_count = 0;
  const user_proxy_handler = {
    get(target, prop, receiver) {
      if (prop === "is_premium") {
        premium_read_count++;
        if (premium_read_count === 1) {
          return true;
        }
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  window.sdWindow = new Proxy(
    {},
    {
      set(target, prop, value, receiver) {
        if (prop === "user") {
          if (value && typeof value === 'object') {
            value = new Proxy(value, user_proxy_handler);
          } else {
            console.warn(
              "[SD-Download]: Non-object value assigned to user property: %o%c\nIf everything works as expected this can safely be ignored.",
              value,
              "color:grey;font-style:italic;"
            );
          }
        }
        return Reflect.set(target, prop, value, receiver);
      },
    }
  );
})();

((open) => {
  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    if (url.match(/.*studydrive\.net\/file-preview/g)) {
      this.addEventListener(
        "load",
        () => {
          let blob = new Blob([this.response], { type: "application/pdf" });
          let url = URL.createObjectURL(blob);
          addButtons(url);
        },
        false
      );
    }
    open.apply(this, arguments);
  };

  const addButtons = (url) => {
    const _id = "jsA7AGx6o2Yi61DvK8iooXEeQtgnKR";

    let el = document.getElementById(_id);
    if (el) {
      el.remove();
    }

    let m = window.location.href.match(/doc\/([^\/]+)/);
    let name = "studydrive-download.pdf";
    if (m && m[1]) {
      name = m[1] + ".pdf";
    }

    const btn_title =
      "Depending on the browser settings this might open and or download the file";

    const mk_btn = (label, options) => {
      let btn = document.createElement("a");
      btn.href = url;
      btn.classList.add("button-85");
      btn.role = "button";
      btn.title = btn_title;
      btn.textContent = label;

      if (options?.download) btn.download = name;
      if (options?.target) btn.target = options.target;

      return btn;
    };

    let container = document.createElement("div");
    container.id = _id;
    container.appendChild(mk_btn("Open", { target: "_blank" }));
    container.appendChild(mk_btn("Download", { download: true }));
    document.body.insertBefore(container, document.body.firstChild);
  };
})(XMLHttpRequest.prototype.open);
