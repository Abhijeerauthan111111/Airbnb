exports.get404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(rootdirectory, 'views', 'router404.html')); // Example: serving a 404 page
    res.render('router404', {
        pagetitle:'404 NOT FOUND', 
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user});
}