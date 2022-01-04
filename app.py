from flask import Flask
from db import mongo


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret!'

    app.config['MONGO_URI'] = 'mongodb://10.11.12.13:27017/feature_flags_POC'

    mongo.init_app(app)  # initialize here!

    import main
    app.register_blueprint(main.main_blueprint)

    return app


app = create_app()


@app.before_first_request
def make_data():
    # check if collection exists, if not create ... hack, don't do this!
    if 'FeatureAttribute' not in mongo.db.list_collection_names():
        mongo.db.create_collection("FeatureAttribute")

    # if 'FeatureAudience' not in mongo.db.list_collection_names():
    #     mongo.db.create_collection("FeatureAudience")

    if 'FeatureFlag' not in mongo.db.list_collection_names():
        mongo.db.create_collection("FeatureFlag")
