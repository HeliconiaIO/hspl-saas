/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { saasApps } from "@saas_apps/js/saas_apps"; // Assumed to be imported correctly

console.log("getSaasInputs", saasApps);


saasApps.include({
    events: Object.assign({}, saasApps.prototype.events, {
        'click #try-trial2': '_onTryTrialClick',  // Event listener for the "Try Trial" button
    }),

    init: function (parent, options) {
        this._super(parent, options);
    },

    // Handle the trial button click event
    _onTryTrialClick: async function () {
        // Await the input data from the getSaasInputs function
        const inputs = await this.getInputs();

        // Check if the user has chosen either apps or a package
        if (!inputs.basketApps && !inputs.chosenPackageId) {
            alert("Please choose apps or a package to install");
            return;
        }

        // Ensure the number of users is provided
//        const userCnt = ($("#users").length ? this.state.numUsers || parseInt($("#users").val(), 0) : 0);
        if (!inputs.userCnt) {
            alert("Number of users are not given");
            return;
        }

        // Construct the URL with the necessary parameters
        let url = `/saas_apps_signup/make_database_for_trial?max_users_limit=${inputs.userCnt}&period=${inputs.period}`;

        // Add the chosen package ID or apps to the URL
        if (inputs.chosenPackageId) {
            url += `&saas_template_id=${inputs.chosenPackageId}`;
        } else {
            url += `&installing_modules=${inputs.basketApps.join(",")}`;
        }

        // Redirect to the generated URL
        window.location = url;
    },
});
