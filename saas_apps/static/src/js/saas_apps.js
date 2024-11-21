/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

export const SaasAppsWidget = publicWidget.Widget.extend({
    selector: '.js_saas_apps', // The selector for your widget's container
    events: {
        'click .app': '_onAppClick',
        'click .package': '_onPackageClick',
        'click .switch-period': '_onPeriodSwitch',
        'click #plus-user': '_onIncreaseUsers',
        'click #minus-user': '_onDecreaseUsers',
        'click #try-trial': '_onTryTrial',
        'click #buy-now': '_onBuyNow',
    },

    init: function (parent, options) {
        this._super(parent, options);
        this.state = {
            period: 'year', // Default to yearly
            basketApps: new Set(),
            chosenPackageId: null,
            numUsers: 1,
            apps: options.apps || [],
        };
        this._fetchPackages();
    },

    // Fetch the packages dynamically
    _fetchPackages: function () {
        rpc('/saas/packages', {
            model: 'saas.template',
            method: 'search_read',
            args: [[["is_package", "=", true]], ['id', 'name', 'year_price', 'month_price', 'is_package']],
            kwargs: {}
        }).then((packages) => {
            this.state.packages = packages;
            this.renderPackages(); // After packages are fetched, render them
        });
    },

    // Handle App selection
    _onAppClick: function (event) {
        const appName = $(event.currentTarget).data('name');
        if (this.state.basketApps.has(appName)) {
            this.state.basketApps.delete(appName);
        } else {
            this.state.basketApps.add(appName);
        }
        this.renderApps();
        this.renderTotalPrice();
        this._updateButtonsVisibility(); // Update button visibility
    },

    // Handle Package selection
    _onPackageClick: function (event) {
        const packageId = $(event.currentTarget).data('packageId');
        // Toggle the selected package ID
        this.state.chosenPackageId = this.state.chosenPackageId === packageId ? null : packageId;

        // Update UI with selected package
        this.renderPackages();
        this.renderTotalPrice(); // Recalculate and update price
        this._updateButtonsVisibility(); // Update button visibility
    },

    // Switch between periods (year/month)
    _onPeriodSwitch: function (event) {
        this.state.period = $(event.currentTarget).data('period');
        this.renderTotalPrice(); // Recalculate price based on selected period
    },

    // Increase user count
    _onIncreaseUsers: function () {
        this.state.numUsers += 1;
        this.renderTotalPrice();
    },

    // Decrease user count
    _onDecreaseUsers: function () {
        if (this.state.numUsers > 1) {
            this.state.numUsers -= 1;
        }
        this.renderTotalPrice();
    },

    // Try trial action
    _onTryTrial: function () {
        this._goToBuild(this.getInputs(), this.state.chosenPackageId);
    },

    // Buy now action
    _onBuyNow: function () {
        // Generate product IDs based on basket apps or selected package
        const productIds = this.state.basketApps.size > 0
            ? Array.from(this.state.basketApps).map(appName =>
                $(`[data-name="${appName}"]`).data(`product-id-${this.state.period}`)
            )
            : [ $(`[data-package-id="${this.state.chosenPackageId}"]`).data(`product-id-${this.state.period}`) ];

        // Check if there are selected apps or packages, if neither is selected, show an alert
        if (productIds.length === 0) {
            return;
        }

        // Determine user count, ensuring we use this.state.numUsers if it exists, else fallback to the DOM value
        const userCnt = ($("#users").length ? this.state.numUsers || parseInt($("#users").val(), 0) : 0);

        // Call the RPC to update the cart and redirect to the checkout page
        rpc('/price/cart/update_json', {
            product_ids: productIds,
            period: this.state.period, // Use this.state.period for consistency
            user_cnt: userCnt
        }).then((res) => {
            window.location.href = res.link;
        });
    },

    // Render the total price calculation
    renderTotalPrice: function () {
        // Calculate the total app prices based on selected apps and period (year/month)
        const sumAppPrices = this.state.apps.filter(app => this.state.basketApps.has(app.name))
            .reduce((acc, app) => {
                const appPrice = this.state.period === 'year' ? app.yearPrice : app.monthPrice;
                return acc + appPrice;
            }, 0);

        // Find the selected package and calculate its price based on the period
        const chosenPackage = this.state.packages.find(pkg => pkg.id === this.state.chosenPackageId);
        let sumPackagePrices = 0;
        if (chosenPackage) {
            sumPackagePrices = this.state.period === 'year' ? chosenPackage.year_price : chosenPackage.month_price;
        }

        // Calculate user price if applicable
        let userPrice = 0;
        if ($("#users_block").length) {
            userPrice = this.state.numUsers * (parseFloat(this.$('#users_block').data("price-" + this.state.period), 1));
        }

        // Calculate the total price by adding app prices, package prices, and user prices
        const totalPrice = sumAppPrices + sumPackagePrices + userPrice;

        // Update the DOM with the calculated values
        this.$('#price').text(totalPrice.toFixed(2));  // Show total price
        this.$('#box-period').text(this.state.period); // Show selected period
        this.$('#users-qty').text(this.state.numUsers); // Show the number of users
        this.$('#apps-qty').text(this.state.basketApps.size + (this.state.chosenPackageId ? 1 : 0)); // Show total apps + package count
        this.$('#users-cnt-cost').text(userPrice.toFixed(2)); // Show user price
        this.$('#apps-cost').text((sumAppPrices + sumPackagePrices).toFixed(2)); // Show total cost of apps + package

        // Optionally, handle button visibility based on the presence of selected apps or packages
        if (this.state.basketApps.size === 0 && !this.state.chosenPackageId) {
            this.$('#btn-block').hide(); // Hide button if nothing is selected
        } else {
            this.$('#btn-block').show(); // Show button if something is selected
        }
    },

    // Render selected apps in the UI
    renderApps: function () {
        this.state.apps.forEach(app => {
            const element = this.$(`[data-name="${app.name}"]`);
            element.toggleClass('green-border', this.state.basketApps.has(app.name));
        });
    },

    // Render selected package in the UI
    renderPackages: function () {
        console.log("this.state.packages", this.state.packages);
        this.state.packages.forEach(pkg => {
            const element = this.$(`[data-package-id="${pkg.id}"]`);
            element.toggleClass('green-border', pkg.id === this.state.chosenPackageId);
        });
    },

    // Get the user inputs for proceeding with the trial or purchase
    getInputs: function () {
        return {
            basketApps: Array.from(this.state.basketApps),
            chosenPackageId: this.state.chosenPackageId,
            period: this.state.period,
            userCnt: this.state.numUsers,
        };
    },

    // Navigate to the build process
    _goToBuild: function (buildParams, templateId) {
        rpc("/check_saas_template", { template_id: templateId }).then((template) => {
            if (template.state === 'ready') {
                const url = `/saas_public/${template.id}/create-fast-build${buildParams}`;
                window.location.href = url;
            } else {
                setTimeout(() => this._goToBuild(buildParams, templateId), 5000);
            }
        });
    },

    // Update button visibility based on selections
    _updateButtonsVisibility: function () {
        if (this.state.basketApps.size > 0 || this.state.chosenPackageId !== null) {
            this.$('#btn-block').show(); // Show the buttons
        } else {
            this.$('#btn-block').hide(); // Hide the buttons if nothing is selected
        }
    },
});

publicWidget.registry.saasAppsWidget = SaasAppsWidget;
