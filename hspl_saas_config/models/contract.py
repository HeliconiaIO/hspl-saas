from odoo import models
from datetime import datetime, timedelta



class ContractContract(models.Model):
    _inherit = "contract.contract"

    def contract_cron_check_invoice(self):
        today = datetime.now().date()
        twenty_days_before = today - timedelta(days=20)
        twenty_days_after = today + timedelta(days=20)
        built_ids = self.env['saas.db'].search([("expiration_date", ">=", twenty_days_before), ("expiration_date", "<=", twenty_days_after)])
        contract_ids = built_ids.mapped("contract_id")
        template = self.env.ref('hspl_saas_config.mail_template_contract_expiry_alert', raise_if_not_found=False)
        for contract in contract_ids:
            if today == today + timedelta(days=contract.expiry_notify_days):
                template.send_mail(contract.id, force_send=True)

    def get_different_days(self):
        today = datetime.now().date()
        return (self.recurring_next_date - today).days if self.recurring_next_date else ''

    def get_renew_payment_link(self):
        web_base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
        built_id = self.env['saas.db'].search([('contract_id', '=', self.id)])
        return web_base_url + '/my/build/%d/renew_subscription' % (built_id.id,) if built_id else ''
