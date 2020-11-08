# CodeMapper

This project currently works on Unix systems like Mac, but will soon work on Windows too. The only issue is that the command is not working on Windows machines just yet.

If you're using this as an npm package, simply install it and then enter the command "codemapper" in your command line once you're in the codebase you want to analyze.
Or, to use this repo on Windows, download it and run "npm start" in the command line.

Either way, an application will run in the command line that will ask for the root path to the project you'd like to analyze. This means the codebase you're analyzing needs to be available on your local machine! It'll default to the current directory you're in to make it easy.

Once you point CodeMapper to the right place, you'll be able to select which files and folders at the root level of the project you'd like to include for analyzing.

And finally, once that finishes, open up the index.html file in the newly generated CodeMapper/Visualization folder in your browser (or if you're lucky, it'll open for you!).

You'll get a page with two buttons on it, leading to different visualizations with more details about your project.

P.S. CodeMapper shines most when looking at JavaScript-heavy projects, as we're able to give more details about JavaScript files. :)