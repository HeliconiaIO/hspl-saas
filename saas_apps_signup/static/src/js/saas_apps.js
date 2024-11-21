/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { getSaasInputs } from "@saas_apps/saas_apps"; // Assumed to be imported correctly

export const SaasTrialWidget = publicWidget.Widget.extend({
    selector: '.js_saas_apps',  // The selector for the trial widget container
    events: {
        'click #try-trial2': '_onTryTrialClick',  // Event listener for the "Try Trial" button
    },

    init: function (parent, options) {
        this._super(parent, options);
    },

    // Handle the trial button click event
    _onTryTrialClick: async function () {
        // Await the input data from the getSaasInputs function
        const inputs = await getSaasInputs();
        console.log("inputs", inputs);

        // Check if the user has chosen either apps or a package
        if (!inputs.chosen_apps && !inputs.chosen_package_id) {
            alert("Please choose apps or a package to install");
            return;
        }

        // Ensure the number of users is provided
        if (!inputs.user_cnt) {
            alert("Number of users are not given");
            return;
        }

        // Construct the URL with the necessary parameters
        let url = `/saas_apps_signup/make_database_for_trial?max_users_limit=${inputs.user_cnt}&period=${inputs.period}`;

        // Add the chosen package ID or apps to the URL
        if (inputs.chosen_package_id) {
            url += `&saas_template_id=${inputs.chosen_package_id}`;
        } else {
            url += `&installing_modules=${inputs.chosen_apps.join(",")}`;
        }

        // Redirect to the generated URL
        window.location = url;
    },
});

publicWidget.registry.saasTrialWidget = SaasTrialWidget;
