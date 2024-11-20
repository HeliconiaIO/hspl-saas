from odoo import api, fields, models


class SaasTemplate(models.Model):
    _inherit = "saas.template"

    expiry_notify_days = fields.Integer(string="Pre Expiry Notification", default=3)


class SaasDB(models.Model):
    _inherit = "saas.db"

    expiry_notify_days = fields.Integer(string="Pre Expiry Notification")

    def write(self, vals):
        res = super(SaasDB, self).write(vals)
        if vals.get("expiry_notify_days"):
            for rec in self:
                rec.contract_id.expiry_notify_days = rec.expiry_notify_days
        return res


class ProductProduct(models.Model):
    _inherit = "product.product"

    expiry_notify_days = fields.Integer(string="Pre Expiry Notification", store=True, related='saas_package_id.expiry_notify_days')


class ContractContract(models.Model):
    _inherit = "contract.contract"

    expiry_notify_days = fields.Integer(related="build_id.expiry_notify_days", string="Pre Expiry Notification")

    @api.model_create_multi
    def create(self, vals_list):
        records = super(ContractContract, self).create(vals_list)
        for res in records:
            if res.build_id and (res.build_id.expiry_notify_days == 0 or not res.build_id.expiry_notify_days):
                expiry_notify_days = res.contract_line_ids.mapped("product_id.saas_package_id").expiry_notify_days
                res.build_id.expiry_notify_days = expiry_notify_days
        return records

    def write(self, vals):
        res = super(ContractContract, self).write(vals)
        if self.mapped("build_id") and (self.mapped("build_id").expiry_notify_days == 0 or not self.mapped("build_id").expiry_notify_days):
            expiry_notify_days = self.mapped("contract_line_ids.product_id.saas_package_id").expiry_notify_days
            self.mapped("build_id").expiry_notify_days = expiry_notify_days
        return res
