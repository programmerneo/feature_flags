class User:
    def __init__(self, name, site_id, country_code=None, is_student=False, role=None):

        self.name = name
        self.site_id = site_id
        self.country_code = country_code
        self.is_student = is_student
        self.role = role

    def to_dict(self):
        return {
            'name': self.name,
            'site_id': self.site_id,
            'country_code': self.country_code,
            'is_student': self.is_student,
            'role': self.role,
        }
