<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
        {{ $t("frontend.contents.trains.title") }}&nbsp;
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
        <v-card prepend-icon="mdi-update" :title="$t('frontend.contents.trains.title')" :subtitle="editForm.name">
          <v-card-text>
            <v-form validate-on="eager" @update:model-value="dialogValidate">
              <!-- 
              //////////////////////////
              # Edit Form Start
              //////////////////////////
              -->
              <v-text-field v-if="!isNew" v-model="editForm.id" :rules="[$rules.requried]" label="id" placeholder="id"
                disabled hint="......." variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainCode" :rules="[$rules.requried]" label="trainCode"
                placeholder="trainCode" hint="........" variant="outlined"></v-text-field>

              <v-text-field v-model="editForm.trainTotalSeats" :rules="[$rules.number]" label="trainTotalSeats"
                placeholder="trainTotalSeats" hint="......." variant="outlined"></v-text-field>
              <!-- 
              //////////////////////////
              # Edit Form End
              //////////////////////////
              -->
              <entity-field class="ma-2" v-model="editForm.trainRoute" :items="trainRouteItems"
                :item-selected="editForm.trainRoute" :item-title="trainRouteItemsTitle"
                :item-value="trainRouteItemsValue" :loading="trainRouteItemsLoading"
                @querySelections="trainRouteItemsQuery" density="default" variant="outlined" placeholder="TrainRoute"
                hint="......." chips>
              </entity-field>

              <entity-field class="ma-2" v-model="editForm.trainDriver" :items="trainDriverItems"
                :item-selected="editForm.trainDriver" :item-title="trainDriverItemsTitle"
                :item-value="trainDriverItemsValue" :loading="trainDriverItemsLoading"
                @querySelections="trainDriverItemsQuery" density="default" variant="outlined" placeholder="TrainDriver"
                hint="......." chips>
              </entity-field>
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
const x = "[/contents/trains]";
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
        { key: "trainCode", title: "Train Code", align: "center" },
        { key: "trainTotalSeats", title: "Train TotalSeats", align: "center" },
        { key: "trainRouteName", title: "Train Route", align: "center" },
        { key: "trainDriverName", title: "Train Driver", align: "end" },
      ],
      sortBy: [
        { key: "id", order: "desc" }
      ],

      initForm: {
        id: undefined,
        trainCode: undefined,
        trainTotalSeats: undefined,
      }
      /////////////////////////////////
      // Config End
      /////////////////////////////////
    },

    trainRouteItems: [],
    trainRouteItemsValue: "id",
    trainRouteItemsTitle: "trainRouteName",
    trainRouteItemsLoading: false,

    trainDriverItems: [],
    trainDriverItemsValue: "id",
    trainDriverItemsTitle: "trainDriverName",
    trainDriverItemsLoading: false,
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
    trainRouteItemsQuery(v) {
      console.log(x, "trainRouteItemsQuery", 1, v);
      this.trainRouteItemsLoading = true;

      $exampleServer.trainRoutes.search({}, {})
        .then(r => {
          console.log(x, "trainRouteItemsQuery", 2, r);
          this.trainRouteItems = r._embedded.trainRoutes;
          this.trainRouteItemsLoading = false;
        })
        .catch(r => {

        });
    },

    trainDriverItemsQuery(v) {
      console.log(x, "trainDriverItemsQuery", 1, v);
      this.trainDriverItemsLoading = true;

      $exampleServer.trainDrivers.search({}, {})
        .then(r => {
          console.log(x, "trainDriverItemsQuery", 2, r);
          this.trainDriverItems = r._embedded.trainDrivers;
          this.trainDriverItemsLoading = false;
        })
        .catch(r => {

        });
    },

    extractSelectionName(selection, titleKey) {
      if (Array.isArray(selection)) {
        return this.extractSelectionName(selection[0], titleKey);
      }
      if (selection && typeof selection === "object") {
        return selection[titleKey] || selection.name || "";
      }
      if (typeof selection === "string") {
        return selection;
      }
      return "";
    },
    // CHANGE POINT: Bus 요청 필드명/관계 필드 변경 시 payload 매핑은 여기서만 수정.
    buildTrainPayload() {
      const payload = Object.assign({}, this.editForm);
      payload.trainRouteName = this.extractSelectionName(payload.trainRoute, this.trainRouteItemsTitle);
      payload.trainDriverName = this.extractSelectionName(payload.trainDriver, this.trainDriverItemsTitle);
      delete payload.trainRoute;
      delete payload.trainRoute;
      return payload;
    },


    ////////////////////////////////////////
    // handle....
    ////////////////////////////////////////
    handleCreate() {
      const payload = this.buildTrainPayload();
      return $exampleServer.trains.create(payload);
    },
    handleRead(entity) {
      return $exampleServer.trains.read(entity);
    },
    handleUpdate() {
      const payload = this.buildTrainPayload();
      console.log(x, "handleUpdate", 1, payload);
      return $exampleServer.trains.update(payload);
    },
    handleDelete() {
      return $exampleServer.trains.delete(this.editForm);
    },
    handleSearch(query) {
      return $exampleServer.trains.search(this.searchForm, query);
    },
    handleEntities(res) {
      this.entitiesTotal = res.page.totalElements;
      this.entities = res._embedded.trains;
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
