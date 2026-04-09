<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
        {{ $t("frontend.contents.trainRoutes.title") }}&nbsp;
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
        <v-card prepend-icon="mdi-update" :title="$t('frontend.contents.trainRoutes.title')" :subtitle="editForm.name">
          <v-card-text>
            <v-form validate-on="eager" @update:model-value="dialogValidate">
              <!-- 
              //////////////////////////
              # Edit Form Start
              //////////////////////////
              -->
              <v-text-field v-if="!isNew" v-model="editForm.id" :rules="[$rules.requried]" label="id" placeholder="id"
                disabled hint="......." variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainRouteName" :rules="[$rules.requried]" label="trainRouteName"
                placeholder="trainRouteName" hint="........" variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainRouteStart" :rules="[$rules.requried]" label="trainRouteStart"
                placeholder="trainRouteStart" hint="........" variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainRouteEnd" :rules="[$rules.requried]" label="trainRouteEnd"
                placeholder="trainRouteEnd" hint="......." variant="outlined"></v-text-field>

              <entity-field class="ma-2" v-model="editForm.trainStations" :items="trainStationsItems"
                :item-selected="editForm.trainStations" :item-title="trainStationsItemsTitle"
                :item-value="trainStationsItemsValue" :loading="trainStationsItemsLoading"
                @querySelections="trainStationsItemsQuery" density="default" variant="outlined"
                placeholder="TrainStations" hint="......." chips>
              </entity-field>
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
const x = "[/contents/trainRoutes]";
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
        { key: "trainRouteName", title: "TrainRouteName", align: "center" },
        { key: "trainRouteStart", title: "TrainRouteStart", align: "center" },
        { key: "trainRouteEnd", title: "TrainRouteEnd", align: "center" },
        { key: "trains", title: "Trains", align: "end" },
        { key: "trainStations", title: "TrainStations", align: "end" },
      ],
      sortBy: [
        { key: "id", order: "desc" }
      ],

      initForm: {
        id: undefined,
        trainRouteName: undefined,
        trainRouteStart: undefined,
        trainRouteEnd: undefined,
        trains: undefined,
        trainStations: undefined,
      },
      /////////////////////////////////
      // Config End
      /////////////////////////////////


    },
    trainsItems: [],
    trainsItemsValue: "id",
    trainsItemsTitle: "trainCode",
    trainsItemsLoading: false,

    trainStationsItems: [],
    trainStationsItemsValue: "id",
    trainStationsItemsTitle: "trainStationName",
    trainStationsItemsLoading: false,
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
    trainsItemsQuery(v) {
      console.log(x, "trainsItemsQuery", 1, v);
      this.trainsItemsLoading = true;

      $exampleServer.trains.search({}, {})
        .then(r => {
          console.log(x, "trainsItemsQuery", 2, r);
          this.trainsItems = r._embedded.trains;
          this.trainsItemsLoading = false;
        })
        .catch(r => {

        });
    },
    trainStationsItemsQuery(v) {
      console.log(x, "trainStationsItemsQuery", 1, v);
      this.trainStationsItemsLoading = true;

      $exampleServer.trainStations.search({}, {})
        .then(r => {
          console.log(x, "trainStationsQuery", 2, r);
          this.trainStationsItems = r._embedded.trainStations;
          this.trainStationsItemsLoading = false;
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
    buildTrainRoutePayload() {
      const payload = Object.assign({}, this.editForm);
      payload.trainStopsNames = this.extractSelectionNames(payload.trainStops, this.trainStopsItemsTitle);
      delete payload.trainStops;
      delete payload.trains;
      return payload;
    },


    ////////////////////////////////////////
    // handle....
    ////////////////////////////////////////
    handleCreate() {
      return $exampleServer.trainRoutes.create(this.buildTrainRoutePayload());
    },
    handleRead(entity) {
      return $exampleServer.trainRoutes.read(entity);
    },
    handleUpdate() {
      return $exampleServer.trainRoutes.update(this.buildTrainRoutePayload());
    },
    handleDelete() {
      return $exampleServer.trainRoutes.delete(this.editForm);
    },
    handleSearch(query) {
      return $exampleServer.trainRoutes.search(this.searchForm, query);
    },
    handleEntities(res) {
      this.entitiesTotal = res.page.totalElements;
      this.entities = res._embedded.trainRoutes;
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
