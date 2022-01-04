from flask import Blueprint, render_template, redirect, request, url_for, current_app
from db import mongo, SQL_DB
from bson.objectid import ObjectId
from bson import json_util
import json

import uuid

import constants as attribute_constants
import services.feature_flag as feature_flag_services
import models.user as user_model

main_blueprint = Blueprint('main', __name__)


@main_blueprint.route('/', strict_slashes=False)
def home():
    return render_template('index.html')


@main_blueprint.route('/attribute_filter/list', strict_slashes=False)
def attributes_list():
    attribute_filter = mongo.db.FeatureAttribute.find({})

    return render_template('attribute_list.html', attribute_filter=attribute_filter)


@main_blueprint.route('/attribute_filter/create', strict_slashes=False, methods=['GET', 'POST'])
def attribute_filter():
    saved_message = None
    attribute_types = attribute_constants.ATTRIBUTE_TYPES
    if request.method == 'POST':

        key = request.form.get('key')
        description = request.form.get('description')
        attribute_type = request.form.get('attribute-type')

        mongo.db.FeatureAttribute.insert_one({'_id': key, 'description': description,
                                              'attribute_type': attribute_type})

        saved_message = f'Attribue saved: {key}'

    return render_template('attribute_create.html', saved_message=saved_message, attribute_types=attribute_types)


@main_blueprint.route('/attribute_filter/edit/<string:attribute_id>', strict_slashes=False, methods=['GET', 'POST'])
def attribute_filter_edit(attribute_id):
    attribute_types = attribute_constants.ATTRIBUTE_TYPES

    attribute_filter = mongo.db.FeatureAttribute.find_one({'_id': attribute_id})
    return render_template('attribute_edit.html', attribute_filter=attribute_filter,
                           attribute_types=attribute_types)


@main_blueprint.route('/attribute_filter/delete/<string:attribute_id>', strict_slashes=False, methods=['POST'])
def attribute_filter_delete(attribute_id):

    mongo.db.FeatureAttribute.delete_one({'_id': attribute_id})

    return redirect(url_for('attributes_list'))


@main_blueprint.route('/flag/list', strict_slashes=False)
def flag_list():

    flags = mongo.db.FeatureFlag.find({})

    return render_template('flag_list.html', flags=flags)


@main_blueprint.route('/flag/delete/<string:flag_id>', strict_slashes=False, methods=['POST'])
def flag_delete(flag_id):

    mongo.db.FeatureFlag.delete_one({'_id': ObjectId(flag_id)})

    return redirect(url_for('main.flag_list'))


@main_blueprint.route('/flag/create', strict_slashes=False, methods=['GET', 'POST'])
def flag_create():
    saved_message = None
    attribute_types = attribute_constants.ATTRIBUTE_TYPES
    attribute_options = attribute_constants.ATTRIBUTE_TYPE_OPTIONS
    attributes = mongo.db.FeatureAttribute.find({})
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')

        flag = mongo.db.FeatureFlag.insert_one(
            {'name': name, 'description': description, 'feature_on': False, 'criteria': []})

        return redirect(url_for('main.flag_edit', flag_id=str(flag.inserted_id)))

    return render_template('flag_create.html', saved_message=saved_message, attribute_types=attribute_types,
                           attribute_options=attribute_options, attributes=attributes)


@main_blueprint.route('/flag/edit/<flag_id>', strict_slashes=False, methods=['GET'])
def flag_edit(flag_id):
    saved_message = None
    attribute_types = attribute_constants.ATTRIBUTE_TYPES
    attribute_options = attribute_constants.ATTRIBUTE_TYPE_OPTIONS
    attributes_data = mongo.db.FeatureAttribute.find({})

    attributes = []
    for attr in attributes_data:
        attributes.append({
            '_id': attr['_id'],
            'description': attr['description'],
            'attribute_type': attr['attribute_type']
        })

    flag = mongo.db.FeatureFlag.find_one({'_id': ObjectId(flag_id)})

    return render_template('flag_edit.html', flag=flag, saved_message=saved_message, attribute_types=attribute_types,
                           attribute_options=attribute_options, attributes=attributes)


@main_blueprint.route('/flag/edit/<flag_id>', strict_slashes=False, methods=['POST'])
def flag_update(flag_id):
    saved_message = None

    name = request.json.get('name')
    description = request.json.get('description')
    criteria = request.json.get('criteria', [])

    mongo.db.FeatureFlag.update_one(
        {'_id': ObjectId(flag_id)},
        {'$set': {'name': name,
                  'description': description,
                  'criteria': criteria}})

    saved_message = f'Attribue saved: {flag_id}'
    flag = mongo.db.FeatureFlag.find_one({'_id': ObjectId(flag_id)})

    return {
        'flag': json.loads(json_util.dumps(flag)),
        'saved_message': saved_message
    }


@main_blueprint.route('/flag/test/<flag_id>', strict_slashes=False)
def test_suite(flag_id):

    flag = mongo.db.FeatureFlag.find_one({'_id': ObjectId(flag_id)})

    if not flag:
        return render_template('test_page.html', result={})

    result = {
        'flag': {
            'name': flag.get('name'),
            'description': flag.get('description'),
            'default': flag.get('default_value'),
        },
        'flag': flag,
        'users': [
        ]
    }

    student = user_model.User(name='Billy', site_id=uuid.UUID('3a8e3555-432f-4933-be73-72b5198ca340'), country_code='US', is_student=True, role=uuid.UUID('AAAAAAAA-AAAA-FFFF-FFAA-000000000009'))  # noqa
    t_teacher = user_model.User(name='Mr TRUE Jones', site_id=uuid.UUID('da6ab683-615f-477f-b302-d2658a452f61'), country_code='US', is_student=False, role=uuid.UUID('AAAAAAAA-AAAA-FFFF-FFAA-000000000008'))  # noqa
    f_teacher = user_model.User(name='Mr FALSE Smith', site_id=uuid.UUID('1907f2ca-a1e5-4162-9d39-e8c5cad3b3bb'), country_code='UK', is_student=False, role=uuid.UUID('AAAAAAAA-AAAA-FFFF-FFAA-000000000008'))  # noqa
    admin = user_model.User(name='Mr GLOBAL', site_id=uuid.UUID('1907f2ca-a1e5-4162-9d39-e8c5cad3b3bb'), country_code='UK', is_student=False, role=uuid.UUID('AAAAAAAA-AAAA-FFFF-FFFB-000000000001'))  # noqa

    users = [
        student.to_dict(),
        t_teacher.to_dict(),
        f_teacher.to_dict(),
        admin.to_dict(),
    ]

    for user_dict in users:
        user_dict['_flag_status'] = feature_flag_services.FeatureFlag.can_use_feature(
            flag_id=ObjectId(flag_id), user_dict=user_dict)

        user_dict['_flag_status'] = feature_flag_services.FeatureFlag.can_use_feature(
            flag_id=ObjectId(flag_id), user_dict=user_dict)  #

        user_dict['_flag_status'] = feature_flag_services.FeatureFlag.can_use_feature(
            flag_id=ObjectId(flag_id), user_dict=user_dict)  #

        user_dict['_flag_status'] = feature_flag_services.FeatureFlag.can_use_feature(flag_id=ObjectId(flag_id), user_dict=user_dict)  # noqa

    result['users'] = users

    return render_template('test_page.html', result=result)


@main_blueprint.route('/schools/list', strict_slashes=False)
def schools():
    SQL = """
    SELECT TOP 20 site_guid, name
    FROM EDU_SEC.dbo.SITE
    WHERE archive_dt IS NULL
    """
    sql_obj = SQL_DB()

    result = sql_obj.execute(SQL)

    schools = []
    for school in result:
        schools.append({'id': school.site_guid, 'name': school.name})

    sql_obj.close()

    return render_template('schools.html', schools=schools)
