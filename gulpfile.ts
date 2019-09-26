import { dest, watch as gulpwatch, src } from "gulp";
import replace from "gulp-replace";
import rename from "gulp-rename";
import clean from "gulp-clean";

const ENVIRONMENTS = {
    production: 'demo-config.sensic.net',
    preproduction: 'demo-config-preproduction.sensic.net',
    development: 's2s.dev/website/dist',
    local: 'localhost:8080',
}

export function clean() {
    return src([ "website/*.html", "!website/*.tmpl.html", "!website/index.html" ], { read: false })
    .pipe(clean());
}

export function setenv() {
    const envUrl = ENVIRONMENTS[process.env.ENV || "local"];
    return src("website/*.tmpl.html")
        .pipe(replace('##ENVDOMAIN##', envUrl))
        .pipe(rename(path => path.basename = path.basename.replace(".tmpl", "")))
        .pipe(dest("website/"));
}

export function watch() {
    gulpwatch(["./website/*.tmpl.html", "./website/js/**"], setenv);
}