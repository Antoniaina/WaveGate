// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    PhysicalPosition,
    WindowEvent,
    tray::{
        MouseButton,
        MouseButtonState,
        TrayIconBuilder,
        TrayIconEvent,
    },
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        let app = tray.app_handle();

                        if let Some(window) = app.get_webview_window("popup") {
                            if let Ok(Some(monitor)) = app.primary_monitor() {
                                let work_area = monitor.work_area();
                                let window_size = window.outer_size().unwrap();

                                let margin = -8;

                                let x = work_area.position.x + work_area.size.width as i32 - window_size.width as i32 - margin;
                                let y = work_area.position.y + work_area.size.height as i32 - window_size.height as i32 - margin;
                                let _ = window.set_position(PhysicalPosition{ x, y });

                            }

                            let _ = window.show();
                            let _ = window.set_focus();
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
        .expect("error while running app");
}
