<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
        {{ $t("frontend.contents.trainStations.title") }}&nbsp;
        <!-- 
        ///////////////////////////
        // Search Field Start
        //////////////////////////
        -->
        <v-text-field class="ms-10" v-model="searchForm.keyword" density="compact" label="Search"
          prepend-inner-icon="mdi-magnify" variant="solo-filled" flat hide-details single-line></v-text-field>
        <!-- 
        //////////////////////////
        // Search Field End
        //////////////////////////
        -->
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table-server fixed-header density="compact" :loading="loading" :search="config.searchBy" :page="1"
        :items-per-page="20" :sort-by="config.sortBy" :items-per-page-options="config.itemsPerPageOptions"
        :headers="config.headers" :item-value="config.itemValue" :items-length="entitiesTotal" :items="entities"
        @update:options="searchAction">
        <!-- 
        //////////////////////////
        // Table Cell Template Start
        //////////////////////////
        -->
        <template v-slot:item.id="{ item }">
          <v-btn variant="plain" color="primary" :text="item.id" style="text-transform: none"
            @click="readAction(item)"></v-btn>
        </template>
        <!-- 
        //////////////////////////
        // Table Cell Template End
        //////////////////////////
        -->

        <template v-slot:footer.prepend>
          <v-btn class="ms-1" text variant="elevated" @click="refreshAction">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>

          <v-btn class="ms-1" text variant="elevated" color="primary" @click="newAction">
            <v-icon>mdi-plus</v-icon>
          </v-btn>

          <v-spacer></v-spacer>
        </template>
      </v-data-table-server>

      <v-dialog v-model="dialog" persistent width="800">
        <v-card prepend-icon="mdi-update" :title="$t('frontend.contents.trainStations.title')"
          :subtitle="editForm.name">
          <v-card-text>
            <v-form validate-on="eager" @update:model-value="dialogValidate">
              <!-- 
              //////////////////////////
              # Edit Form Start
              //////////////////////////
              -->
              <v-text-field v-if="!isNew" v-model="editForm.id" :rules="[$rules.requried]" label="id" placeholder="id"
                disabled hint="......." variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainStationName" :rules="[$rules.requried]" label="trainStationName"
                placeholder="trainStationName" hint="........" variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainStationCode" :rules="[$rules.requried]" label="trainStationCode"
                placeholder="trainStationCode" hint="........" variant="outlined"></v-text-field>

              <!-- 
              //////////////////////////
              # Edit Form End
              //////////////////////////
              -->
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn class="ms-5" variant="elevated" color="primary" text="Save" :disabled="!validate"
              @click="isNew ? createAction(e) : updateAction(e)"></v-btn>
            <v-btn text="Cancel" @click="cancelAction"></v-btn>

            <v-spacer></v-spacer>
            <v-btn v-if="!isNew" color="error" text="Delete" variant="text" @click="deleteAction"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script>
const x = "[/contents/bars]";
import $exampleServer from "@@/assets/apis/example-server";
import $common from "@@/assets/stores/common";

export default {
  data: () => ({
    loading: false,
    dialog: false,
    isNew: false,
    validate: false,

    searchForm: {},
    editForm: {},

    entities: [],
    entitiesTotal: 0,

    config: {
      searchBy: "",
      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],

      /////////////////////////////////
      // Config Start
      /////////////////////////////////
      itemValue: "id",

      headers: [
        { key: "id", title: "Id", align: "start" },
        { key: "trainStationName", title: "TrainStationName", align: "center" },
        { key: "trainStationCode", title: "TrainStationCode", align: "center" },
        { key: "trainRoutes", title: "TrainRoutes", align: "center" },
      ],
      sortBy: [
        { key: "id", order: "desc" }
      ],

      initForm: {
        id: undefined,
        trainStationName: undefined,
        trainStationCode: undefined,
        trainRoutes: undefined,
      },
      /////////////////////////////////
      // Config End
      /////////////////////////////////
    },

    trainRoutesItems: [],
    trainRoutesItemsValue: "id",
    trainRoutesItemsTitle: "trainRouteName",
    trainRoutesItemsLoading: false,
  }),

  watch: {
    searchForm: {
      handler(e) {
        this.refreshAction();
      },
      deep: true,
    },
  },

  computed: {
    subtitle: $common.computed.subtitle,
  },

  methods: {

    ////////////////////////////////////////
    // query....
    ////////////////////////////////////////
    trainRoutesItemsQuery(v) {
      console.log(x, "trainRoutesItemsQuery", 1, v);
      this.trainRoutesItemsLoading = true;

      $exampleServer.trainRoutes.search({}, {})
        .then(r => {
          console.log(x, "trainRoutesItemsQuery", 2, r);
          this.trainRoutesItems = r._embedded.trainRoutes;
          this.trainRoutesItemsLoading = false;
        })
        .catch(r => {

        });
    },

    extractSelectionNames(selection, titleKey) {
      if (!Array.isArray(selection)) {
        if (selection && typeof selection === "object") {
          return [selection[titleKey] || selection.name].filter(Boolean);
        }
        return typeof selection === "string" ? [selection] : [];
      }

      return selection
        .map((item) => {
          if (item && typeof item === "object") {
            return item[titleKey] || item.name;
          }
          return item;
        })
        .filter(Boolean);
    },
    buildTrainStopPayload() {
      const payload = Object.assign({}, this.editForm);
      const routeNames = this.extractSelectionNames(payload.trainRoutes, this.trainRoutesItemsTitle);
      payload.trainRoutesNames = routeNames;
      payload.trainRouteNames = routeNames;
      payload.trainRoutes = routeNames;

      payload.stopName = payload.trainStopName;
      payload.stopLocation = payload.trainStopLocation;

      delete payload.trainRoutes;
      return payload;
    },


    ////////////////////////////////////////
    // handle....
    ////////////////////////////////////////
    handleCreate() {
      return $exampleServer.trainStations.create(this.buildTrainStopPayload());
    },
    handleRead(entity) {
      return $exampleServer.trainStations.read(entity);
    },
    handleUpdate() {
      return $exampleServer.trainStations.create(this.buildTrainStopPayload());
    },
    handleDelete() {
      return $exampleServer.trainStations.delete(this.editForm);
    },
    handleSearch(query) {
      return $exampleServer.trainStations.search(this.searchForm, query);
    },
    handleEntities(res) {
      this.entitiesTotal = res.page.totalElements;
      this.entities = res._embedded.trainStations;
      return res;
    },
    handleEntity(res) {
      this.editForm = res ? res : Object.assign({}, this.config.initForm);
      return res;
    },

    ////////////////////////////////////////
    //
    ////////////////////////////////////////
    dialogOpen(isNew) {
      this.dialog = true;
      this.isNew = isNew;
      return "opened";
    },
    dialogClose() {
      this.dialog = false;
      this.isNew = false;
      return "closed";
    },
    dialogValidate(r) {
      this.validate = r;
    },

    ////////////////////////////////////////
    //
    ////////////////////////////////////////
    confirmBefore(code) {
      let msg = this.$t(`$dialog.before.${code}`);
      return this.$dialog.confirm(msg);
    },
    confirmAfter(code) {
      let msg = this.$t(`$dialog.after.${code}`);
      return this.$dialog.alert(msg);
    },
    confirmError(code) {
      let msg = this.$t(`$dialog.error.${code}`);
      return this.$dialog.alert(msg, code);
    },

    ////////////////////////////////////////
    //
    ////////////////////////////////////////
    actionStart(loading) {
      this.loading = true == loading ? true : false;
      return Promise.resolve();
    },
    actionEnd(refresh) {
      this.loading = false;
      if (true == refresh) {
        this.dialog = false;
        this.isNew = false;
        this.refreshAction();
      }
    },

    ////////////////////////////////////////
    //
    ////////////////////////////////////////
    refreshAction() {
      this.config.searchBy = String(Date.now());
    },

    searchAction(params) {
      this.actionStart(true)
        .then((r) => {
          return this.handleSearch(params);
        })
        .then((r) => {
          console.log(r);
          return this.handleEntities(r);
        })
        .then((r) => {
          return this.actionEnd(false);
        })
        .catch((e) => {
          return this.confirmError(e);
        })
        .catch((e) => {
          this.$router.push("/");
        });
    },

    newAction() {
      this.actionStart(true)
        .then((r) => {
          return this.handleEntity();
        })
        .then((r) => {
          return this.dialogOpen(true);
        })
        .then((r) => {
          return this.actionEnd(false);
        });
    },

    cancelAction() {
      this.actionStart(true)
        .then((r) => {
          return this.dialogClose();
        })
        .then((r) => {
          return this.handleEntity();
        })
        .then((r) => {
          return this.actionEnd(false);
        });
    },

    createAction() {
      this.confirmBefore("create")
        .then((r) => {
          return this.actionStart(true);
        })
        .then((r) => {
          return this.handleCreate();
        })
        .then((r) => {
          return this.confirmAfter("create");
        })
        .then((r) => {
          return this.handleEntity();
        })
        .then((r) => {
          return this.actionEnd(true);
        })
        .catch((r) => {
          return this.confirmError(r);
        })
        .catch((r) => {
          return this.actionEnd(true);
        });
    },

    readAction(entity) {
      this.actionStart(true)
        .then((r) => {
          return this.handleRead(entity);
        })
        .then((r) => {
          return this.handleEntity(r);
        })
        .then((e) => {
          return this.dialogOpen(false);
        })
        .then((e) => {
          return this.actionEnd(false);
        })
        .catch((e) => {
          return this.confirmError(e);
        })
        .catch((e) => {
          return this.actionEnd(true);
        });
    },

    updateAction() {
      this.confirmBefore("update")
        .then((r) => {
          return this.actionStart(true);
        })
        .then((r) => {
          return this.handleUpdate();
        })
        .then((r) => {
          return this.confirmAfter("update");
        })
        .then((r) => {
          return this.handleEntity();
        })
        .then((r) => {
          return this.actionEnd(true);
        })
        .catch((r) => {
          return this.confirmError(r);
        })
        .catch((r) => {
          return this.actionEnd(true);
        });
    },

    deleteAction() {
      this.confirmBefore("delete")
        .then((r) => {
          return this.actionStart(true);
        })
        .then((r) => {
          return this.handleDelete();
        })
        .then((r) => {
          return this.confirmAfter("delete");
        })
        .then((r) => {
          return this.handleEntity();
        })
        .then((r) => {
          return this.actionEnd(true);
        })
        .catch((r) => {
          return this.confirmError(r);
        })
        .catch((r) => {
          return this.actionEnd(true);
        });
    },
  },

  mounted() {
    this.subtitle = x;
  },
};
</script>
