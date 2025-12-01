import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// @ts-ignore
import { exec } from "child_process";

let readingTimeDebounce: any;
const readingTime = () => ({
	name: "run-reading-time-on-change",
	configureServer(server:any) {
		server.watcher.add("./src/content/posts");

		server.watcher.on("change", (path:string) => {
			if (!path.includes("content/posts")) return;
			if (readingTimeDebounce) clearTimeout(readingTimeDebounce);

			readingTimeDebounce = setTimeout(() => {
				exec("bun scripts/reading-time.ts", (err:any, stdout:any, stderr:any) => {
					if (stdout) console.log(stdout);
					if (stderr) console.error(stderr);
					if (err) console.error(`Error executing reading-time script: ${err}`);
				});
			}, 1000);


		});
	}
});

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), readingTime()],
});
