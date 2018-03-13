module.exports = {
    secret: 'asdff8sdasws81as',
    shortExpire: 3 * 60 * 60 * 1000, //3 hours
    longExpire: 7 * 24 * 60 * 60 * 1000, //7 days
    url: 'mongodb://localhost:27017/vincent',
    session: {
        name: 'blog.sid',
        secret: 'randomwhatever123',
        cookie: {
            //cookie not accessible on client using js
            httpOnly: true,
            //change to true when https enabled
            secure: false,
            //8 days
            maxAge: 8 * 24 * 60 * 60 * 1000
        }
    }
}