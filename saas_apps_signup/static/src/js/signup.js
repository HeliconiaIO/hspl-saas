/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { session } from "@web/session";

export const SaasSignupWidget = publicWidget.Widget.extend({
    selector: '.oe_signup_form',  // The selector for your widget's container
    events: {
        'submit .oe_signup_form': '_onFormSubmit',
        'change #company_name': '_onCompanyNameChange',
        'change #database_name': '_onDatabaseNameChange',
    },

    init: function (parent, options) {
        this._super(parent, options);
        this.state = {
            // Initialize necessary state if needed
        };
    },

    // Form submit handler
    _onFormSubmit: function (ev) {
        ev.preventDefault();  // Prevent the form from submitting traditionally
        this.$(".loader").removeClass("hid");  // Show loader when form is submitted
    },

    // Company name change handler
    _onCompanyNameChange: function (event) {
        var databaseName = event.target.value.toLowerCase().replace(/[^[a-z0-9_-]/gi, '');
        this.$("#database_name").val(databaseName).trigger("change");
    },

    // Database name change handler
    _onDatabaseNameChange: function (event) {
        const helper = this.$("#build-domain-helper");
        const submitBtn = this.$('.oe_login_buttons > button[type="submit"]');

        // Reset status and disable submit button initially
        helper.find(".build-domain-helper_status").hide();
        submitBtn.attr("disabled", "disabled");

        if (!event.target.value) return;

        helper.find(".build-domain-helper_status-loading").show();

        // Make the RPC call to check if the database slot is available
        rpc("/saas_apps_signup/is_database_slot_available", {
            database_name: event.target.value,
            operator_id: this.$("[name=operator_id]").val(),
        }).then((response) => {
            helper.find(".build-domain-helper_status").hide();
            if (response.domain) {
                helper.find("span.domain").html(response.domain);
                helper.find(".build-domain-helper_status-true").show();
                submitBtn.attr("disabled", null);  // Enable the submit button
            } else {
                helper.find(".build-domain-helper_status-false").html(response.answer).show();
            }
        }).catch((error) => {
            helper.find(".build-domain-helper_status").hide();
            helper.find(".build-domain-helper_status-false").html("Error occurred").show();
        });
    },
});

publicWidget.registry.saasSignupWidget = SaasSignupWidget;
