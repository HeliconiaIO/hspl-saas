# -*- coding: utf-8 -*-
{
    'name': "HSPL SaaS",

    'description': """
        HSPL SaaS
    """,

    'author': "Heliconia Solutions Pvt. Ltd.",
    'website': "https://www.heliconia.io",

    'category': 'Marketing',
    'version': '18.0.1.0.0',
    "license": "AGPL-3",
    'depends': ['base', 'saas_apps', 'contract', 'saas_contract'],

    'data': [
        'data/contract_cron.xml',
        'data/mail_template.xml',
        'views/views.xml',
        'views/templates.xml',
        'views/saas_views.xml',
    ],
}
