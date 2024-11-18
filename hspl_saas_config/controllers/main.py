from odoo.http import route, request
from odoo.addons.saas_apps.controllers.main import SaaSAppsController
from ast import literal_eval


class HSPLAppsController(SaaSAppsController):
    @route("/price", type="http", auth="public", website=True)
    def user_page(self, **kw):
        response = super().user_page(**kw)
        show_users = literal_eval(request.env['ir.config_parameter'].sudo().get_param('saas_apps.show_users', 'False'))
        show_monthly = literal_eval(request.env['ir.config_parameter'].sudo().get_param('saas_apps.show_monthly', 'False'))
        show_yearly = literal_eval(request.env['ir.config_parameter'].sudo().get_param('saas_apps.show_yearly', 'False'))
        response.qcontext.update({
            "show_users": show_users,
            "show_monthly": show_monthly,
            "show_yearly": show_yearly,
        })
        return response
