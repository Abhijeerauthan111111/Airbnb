/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,ejs}",    // includes all html/ejs files in views and subfolders
    "./views/partials/**/*.{html,ejs}",  // specifically includes partials folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}