# -*- coding: utf-8 -*-
{
    'name': "HSPL SaaS",

    'description': """
        HSPL SaaS
    """,

    'author': "Heliconia Solutions Pvt. Ltd.",
    'website': "https://www.heliconia.io",

    'category': 'Marketing',
    'version': '16.0.1.0.0',

    'depends': ['base', 'saas_apps'],

    'data': [
        'views/views.xml',
        'views/templates.xml',
    ],
    "assets": {
        "web.assets_frontend": [
            ('remove', 'saas_apps/static/src/js/saas_apps.js'),
            "hspl_saas_config/static/src/js/saas_apps.js",
        ],
    },
}
