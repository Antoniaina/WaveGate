// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager, WindowEvent, tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent}
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("popup") {
                            if let Ok(true) = window.is_visible() {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }                       
                    }
                })
                .build(app)?;

            app.manage(tray);

            let window = app.get_webview_window("popup").unwrap();
            let window_handle = window.clone();

            window.on_window_event(move |event| {
                if let WindowEvent::Focused(false) = event {
                    let _ = window_handle.hide();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running EqControl");
}