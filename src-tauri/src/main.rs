// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    collections::HashMap, sync::Mutex
};

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

#[derive(Debug, serde::Deserialize)]
struct EqPayload {
    enabled: bool,
    bands: HashMap<u32, f32>,
}

#[derive(Debug)]
struct EqState {
    enabled: bool,
    bands: HashMap<u32, f32>,
}

#[tauri::command]
fn update_eq(state: tauri::State<'_, Mutex<EqState>>, payload: EqPayload) -> Result<(), String> {
    let mut eq = state.lock().unwrap();
    
    eq.enabled = payload.enabled;
    eq.bands = payload.bands;

    let config = graphic_eq_config(&eq);

    println!(" {}", config);
    
    Ok(())
}

fn graphic_eq_config(eq: &EqState) -> String {
    let values = eq.bands
        .iter()
        .map(|(freq, gain)| format!("{} {}", freq, gain))
        .collect::<Vec<_>>()
        .join("; ");

    let prefix = if eq.enabled {""} else {"# "};
    format!("{prefix}GraphicEQ: {values}")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![update_eq])
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

            app.manage(Mutex::new(EqState {
                enabled: true,
                bands: HashMap::new(),
            }));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running app");
}
