from odoo import api, fields, models


class HSPLConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    show_monthly = fields.Boolean(
        string="Show Monthly packages", config_parameter="saas_apps.show_monthly"
    )
    show_yearly = fields.Boolean(
        string="Show Yearly packages", config_parameter="saas_apps.show_yearly"
    )
    show_users = fields.Boolean(
        "Show Users", config_parameter="saas_apps.show_users"
    )
