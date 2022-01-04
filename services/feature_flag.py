from db import mongo

import uuid


class FeatureFlag:

    @classmethod
    def can_use_feature(cls, flag_id, user_dict):
        flag = mongo.db.FeatureFlag.find_one({'_id': flag_id})

        if not flag:
            return False

        if flag.get('feature_on') == 'true':
            return True

        criterias = flag['criteria']

        if not criterias:
            return False

        return FeatureFlag._match_criteria_to_user(criterias, user_dict)

    @staticmethod
    def _match_criteria_to_user(criterias, user_dict):
        result = False

        for criteria_attrbs in criterias:
            for criteria in criteria_attrbs:

                data_type = criteria.get('data_type')
                match_type = criteria.get('match_type')
                name = criteria.get('name')
                value = criteria.get('value')

                result = FeatureFlag._evaluate_criteria(data_type, name, value, match_type, user_dict)

                if not result:
                    break  # jump out of loop if any False

            if result:
                break  # jump out of loop if all True

        return result or False

    @staticmethod
    def _evaluate_criteria(data_type, name, value, match_type, user_dict):
        result = False

        if data_type == 'bool':
            bool_value = value == 'true'
            result = bool(user_dict.get(name)) is bool_value   # <<<< fix data mongo real python bool
        elif data_type == 'string':
            user_attibute = str(user_dict.get(name))
            if match_type == 'eq':
                result = user_attibute == value
            elif match_type == 'neq':
                result = user_attibute != value
            elif match_type == 'contains' or match_type == 'list':
                result = user_attibute in value
            elif match_type == 'not_list':
                result = user_attibute not in value
        elif data_type == 'guid':
            user_attibute = str(user_dict.get(name))  # <<<<<-fix data in Mongo to be real guid
            if match_type == 'eq':
                result = user_attibute == value
            elif match_type == 'neq':
                result = user_attibute != value
            elif match_type == 'list':
                result = user_attibute in value
            elif match_type == 'not_list':
                result = user_attibute not in value
        elif data_type == 'int':
            user_attibute = int(user_dict.get(name))
            if match_type == 'eq':
                result = user_attibute == value
            elif match_type == 'neq':
                result = user_attibute != value
            elif match_type == 'list':
                result = user_attibute in value
            elif match_type == 'not_list':
                result = user_attibute not in value
            elif match_type == 'gt':
                result = user_attibute > value
            elif match_type == 'gte':
                result = user_attibute >= value
            elif match_type == 'lt':
                result = user_attibute < value
            elif match_type == 'lte':
                result = user_attibute <= value
        else:  # any type
            raise Exception("Can not determine the attribute data type!")

        return result
