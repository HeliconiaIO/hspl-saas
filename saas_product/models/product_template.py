# Copyright 2020 Eugene Molotov <https://it-projects.info/team/em230418>
# License MIT (https://opensource.org/licenses/MIT).

from odoo import api, fields, models
from dateutil.relativedelta import relativedelta


class ProductTemplate(models.Model):

    _inherit = "product.template"

    is_saas_product = fields.Boolean("Is SaaS product?", default=False)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get("is_saas_product"):
                vals["taxes_id"] = [(5,)]
                vals["supplier_taxes_id"] = [(5,)]
                vals["invoice_policy"] = "order"
        return super(ProductTemplate, self).create(vals_list)


class Product(models.Model):

    _inherit = "product.product"

    def _get_expiration_timedelta(self):
        self.ensure_one()
        self = self.sudo()
        if self.env.ref("saas_product.product_attribute_value_subscription_annually").id in self.mapped('product_template_variant_value_ids.product_attribute_value_id').ids:
            return relativedelta(years=1)
        elif self.env.ref("saas_product.product_attribute_value_subscription_monthly").id in self.mapped('product_template_variant_value_ids.product_attribute_value_id').ids:
            return relativedelta(months=1)
        else:
            raise NotImplementedError
