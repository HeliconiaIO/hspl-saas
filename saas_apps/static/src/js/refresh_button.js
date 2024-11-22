import { ListController } from "@web/views/list/list_controller";
import { useService } from "@web/core/utils/hooks";
import {registry} from "@web/core/registry";
import {listView} from "@web/views/list/list_view";

export class ManageAppsController extends ListController {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.action = useService("action");
    }

    async refresh_apps_button() {
        const action = await this.orm.call("saas.app", 'action_make_applist_from_local_instance', []);
        return this.actionService.doAction(action);
    }
}

registry.category("views").add("saas_apps_tree", {
    ...listView,
    buttonTemplate: 'ManageApps.buttons',
    Controller: ManageAppsController,
});
