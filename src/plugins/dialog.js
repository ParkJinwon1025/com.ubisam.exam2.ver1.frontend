import Vue3ConfirmDialog from "vue3-confirm-dialog";
import "vue3-confirm-dialog/style";


import $i18n from "./locales";
const $t = $i18n.global.t;

class ConfirmDialog {
  
  constructor($confirm) {
    this.$confirm = $confirm;
  }

  confirm(code, error) {

    return new Promise((resolve, reject) => {

      // let isArray = Array.isArray(formattings);
      // let args = isArray ? formattings : [formattings];

      let title = $t("$dialog.confirm.title");
      let yes = $t("$dialog.confirm.yes");
      let no = $t("$dialog.confirm.no");
      let msg = $t(code); if(msg == code) { msg = code;}

      this.$confirm({
        title: title,
        message: msg,
        button: {
          yes: yes,
          no: no,
        },
        callback: (confirm, auth) => {

            if(error) {
              reject({message:no, confirm:confirm, error:error});
            }else{
              if(true == confirm) {
                resolve({message:yes, confirm:confirm});
              }else{
                //
              }
            }
        },
      });
    });
  }

  alert(code, error) {

    return new Promise((resolve, reject) => {

      // let isArray = Array.isArray(formattings);
      // let args = isArray ? formattings : [formattings];
      // let message = $t("$dialog.alert.message", args);

      let title = $t("$dialog.alert.title");
      let yes = $t("$dialog.alert.yes");
      let msg = $t(code); if(msg == code) { msg = code;}


      this.$confirm({
        title: title,
        message: msg,
        button: {
          yes: yes,
        },
        callback: (confirm, auth) => {
          if(error) {
            reject({message:yes, confirm:confirm, error:error});
          }else{
            resolve({message:yes, confirm:confirm});
          }
        },
      });
    });
  }
}

export default {


  install: (app, options) => {


    app.use(Vue3ConfirmDialog);
    app.component("vue3-confirm-dialog", Vue3ConfirmDialog.default);

    const _dialog = new ConfirmDialog(app["$confirm"]);

    app.config.globalProperties.$dialog = _dialog;
    app.provide("$dialog", _dialog);
  },
};
