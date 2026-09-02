import React, { createContext, useCallback, useContext, useState } from "react";
import CustomDialog, {
  CUSTOMDIALOGSTATUS,
} from "../components/CustomDialog";
import Loading from "../components/Loading/Loading";

/**
 * App-wide confirmation dialog.
 *
 * This file owns state only — the markup lives in components/CustomDialog.js.
 *
 * Mount the provider once (App.js already does) and open a dialog from
 * anywhere:
 *
 *   const openDialog = useCustomDialog();
 *
 *   openDialog({
 *     title: "Delete item",
 *     message: "This cannot be undone.",
 *     status: CUSTOMDIALOGSTATUS.error,
 *     confirmText: "Delete",
 *     onConfirm: () => remove(id),
 *   });
 *
 * Accepted options: title, message, confirmText, cancelText, showCancel,
 * showConfirm, status, allowClickOutside, onConfirm, selectedData.
 */
const CustomDialogContext = createContext();

export { CUSTOMDIALOGSTATUS };

export const CustomDialogProvider = ({ children }) => {
  const [dialogProps, setDialogProps] = useState(null);
  const [loading, setLoading] = useState(false);

  const openDialog = useCallback((props) => {
    setDialogProps(props);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogProps(null);
  }, []);

  const confirmAction = useCallback(async () => {
    if (dialogProps?.onConfirm) {
      setLoading(true);
      try {
        // await so an async onConfirm keeps the spinner up until it settles
        await dialogProps.onConfirm(dialogProps.selectedData);
      } finally {
        setLoading(false);
      }
    }
    closeDialog();
  }, [dialogProps, closeDialog]);

  return (
    <CustomDialogContext.Provider value={openDialog}>
      {children}
      {dialogProps ? (
        <CustomDialog
          {...dialogProps}
          visible={dialogProps.visible ?? true}
          onClose={dialogProps.onClose ?? closeDialog}
          onConfirm={confirmAction}
        />
      ) : null}
      <Loading showDialog={loading} />
    </CustomDialogContext.Provider>
  );
};

/** Returns `openDialog(options)`. Throws if used outside the provider. */
export const useCustomDialog = () => {
  const openDialog = useContext(CustomDialogContext);
  if (!openDialog) {
    throw new Error(
      "useCustomDialog must be used within a CustomDialogProvider",
    );
  }
  return openDialog;
};
