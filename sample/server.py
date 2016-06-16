#!/usr/bin/python
# -*- coding: UTF-8 -*-

import os
import base64
import tornado.ioloop
import tornado.web


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("sample.html")

    def post(self):
        image_name = self.get_argument("name", "")
        image_size = self.get_argument("size", 0)
        image_data = self.get_argument("data", "")

        if image_data == "":
            image_data = self.request.files['data'][0]['body']

        # decode image data
        data = image_data.split(",")
        metadata = data[0]  # data:image/png;base64
        body = ""

        # sometimes when body data is white
        try:
            body = data[1]
        except:
            pass

        f = open(os.path.join("uploads", image_name), "wb")
        f.write(base64.decodestring(body))
        f.close()

        # return image url
        # self.write({ "thumb":"/static/sample/uploads/" + image_name})
        self.write("/static/sample/uploads/" + image_name)


class CDNSample(tornado.web.RequestHandler):
    """sample connecting to Loadingplay's CDN"""

    def get(self):
        self.render("sample_cdn.html")


application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/cdn", CDNSample)
    ],
    template_path=os.path.dirname(__file__),
    static_path=os.path.join('..'),
    debug=True
)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
