// use ic_cdk::{init, caller, query, update};
// use std::cell::RefCell;
// use std::collections::HashMap;
// use candid::{CandidType, Principal};
// use serde::{Serialize, Deserialize};
// thread_local! {
//     static USER_ROLES: RefCell<HashMap<Principal, Role>> = RefCell::new(HashMap::new());
//     static DEPLOYER_PRINCIPAL: RefCell<Option<Principal>> = RefCell::new(None); // Stores the original deployer
// }

// /// Initializer function for the canister.
// /// Sets the deployer of the canister as the initial Admin.
// /// This runs only once on canister deployment.
// #[init]
// fn init() {
//     let deployer = caller();
//     USER_ROLES.with(|m| {
//         m.borrow_mut().insert(deployer, Role::Developer);
//     });

// #[derive(Clone, Debug, CandidType, Deserialize, PartialEq, Eq)]
// pub enum Role {
//     Developer,
//     Admin,
//     Student,
//     Professor,
//     Guest,
// }

// // ──────────────────────────────────────────────────────────────
// // User / Role Management Functions
// // ──────────────────────────────────────────────────────────────

// /// This is the central login function.
// /// The user calls this after authenticating with Internet Identity,
// /// specifying their intended role.
// ///
// /// Logic:
// /// 1. If the user already has a role in USER_ROLES, their existing role is returned.
// /// 2. If the user is new (no role):
// ///    a. If requested_role is Admin, they are assigned Guest if any Admin already exists.
// ///       This prevents random users from claiming Admin if the deployer already is one.
// ///    b. If requested_role is Student, Professor, or Guest, they are assigned that role.
// #[update]
// fn login_as_role(requested_role: Role) -> Role {
//     let me = caller();
//     assert!(me != Principal::anonymous(), "Cannot login with an anonymous principal.");

//     USER_ROLES.with(|m| {
//         let mut user_map = m.borrow_mut();
//         // 1. If user already has a role, return their existing role.
//         if let Some(existing_role) = user_map.get(&me) {
//             ic_cdk::println!("User {:?} logged in. Existing role: {:?}. Requested role: {:?}", me, existing_role, requested_role);
//             existing_role.clone() // Return their actual, existing role
//         } else {
//             // 2. New user: Determine the role to assign.
//             let assigned_role = match requested_role {
//                 Role::Admin => {
//                     // Check if any Admin exists (which the deployer will be after init()).
//                     // If an Admin exists, new users requesting Admin become Guest.
//                     if user_map.values().any(|r| matches!(r, Role::Admin)) {
//                         ic_cdk::println!("New user {:?} requested Admin, but an Admin already exists. Assigning Guest.", me);
//                         Role::Guest
//                     } else {
//                         // This case should ideally only be hit if init() somehow failed
//                         // or data was wiped uniquely. It's a fallback to allow an admin if absolutely none exist.
//                         ic_cdk::println!("New user {:?} requested Admin, and no Admin currently exists. Assigning Admin.", me);
//                         Role::Admin
//                     }
//                 },
//                 _ => { // Requested role is Student, Professor, or Guest. Assign it.
//                     ic_cdk::println!("New user {:?} logging in, assigning requested role: {:?}", me, requested_role);
//                     requested_role
//                 }
//             };
//             user_map.insert(me, assigned_role.clone());
//             assigned_role
//         }
//     })
// }

// /// Admin-only: Assigns a new role to a specified user principal.
// /// The caller must have the Admin role.
// /// This is the primary method for the initial deployer-admin to assign roles.
// #[update]
// fn assign_role(user: Principal, role: Role) {
//     require_admin();
//     USER_ROLES.with(|m| {
//         m.borrow_mut().insert(user, role.clone());
//     });
//     ic_cdk::println!("Admin {:?} assigned role {:?} to user {:?}.", caller(), role, user);
// }

// /// Returns the role of the current caller.
// #[query]
// fn my_role() -> Role {
//     let me = caller();
//     USER_ROLES.with(|m| m.borrow().get(&me).cloned().unwrap_or(Role::Guest))
// }

// /// Admin-only: Enumerates all registered users and their assigned roles.
// /// The caller must have the Admin role.
// #[query]
// fn list_users() -> Vec<(Principal, Role)> {
//     require_admin();
//     USER_ROLES.with(|m| {
//         m.borrow()
//             .iter()
//             .map(|(p, r)| (*p, r.clone()))
//             .collect()
//     })
// }

// /// Public: Returns a list of every known Principal that has interacted with the canister.
// #[query]
// fn list_principals() -> Vec<Principal> {
//     USER_ROLES.with(|m| m.borrow().keys().cloned().collect())
// }

// /// Public: Returns the deployer's Principal ID (if set).
// #[query]
// fn get_deployer_principal() -> Option<Principal> {
//     DEPLOYER_PRINCIPAL.with(|p| p.borrow().clone())
// }

// /// Returns the caller's Principal ID.
// #[query]
// fn whoami() -> Principal {
//     caller()
// }

// // Export Candid interface for the canister.
// ic_cdk::export_candid!();

//     DEPLOYER_PRINCIPAL.with(|p| {
//         *p.borrow_mut() = Some(deployer);
//     });
//     ic_cdk::println!("Canister initialized. Deployer {:?} set as Developer.", deployer);
// }
// #[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq, Eq)]
// pub struct LoginInfo {
//     pub user: String,
//     pub role: String,
// }

// // Helper function to check if a principal has Admin privileges.
// fn is_admin(p: Principal) -> bool {
//     USER_ROLES.with(|m| matches!(m.borrow().get(&p), Some(Role::Admin)))
// }

// // Helper function to assert that the caller is an Admin.
// fn require_admin() {
//     let me = caller();
//     assert!(me != Principal::anonymous(), "Authentication required: Caller is anonymous.");
//     assert!(is_admin(me), "Authorization failed: Only admins can call this method.");
//     ic_cdk::println!("Admin {:?} successfully called an admin-only method.", me);
// }

use ic_cdk::{init, caller, query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};

// ✅ 1) Define Role type before use
#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq, Eq)]
pub enum Role {    
    Admin,
    Student,
    Professor,
    Guest,
    Developer,
}

// ✅ 2) Thread-local storage using Role
thread_local! {
    static USER_ROLES: RefCell<HashMap<Principal, Role>> = RefCell::new(HashMap::new());
    static DEPLOYER_PRINCIPAL: RefCell<Option<Principal>> = RefCell::new(None);
}

#[init]
fn init() {
    let deployer = caller();

    USER_ROLES.with(|m| {
        m.borrow_mut().insert(deployer, Role::Developer);
    });

    DEPLOYER_PRINCIPAL.with(|p| {
        *p.borrow_mut() = Some(deployer);
    });

    ic_cdk::println!("Canister initialized. Deployer {:?} set as Developer.", deployer);
}

#[update]
fn login_as_role(requested_role: Role) -> Role {
    let me = caller();
    assert!(me != Principal::anonymous(), "Cannot login anonymously.");

    USER_ROLES.with(|m| {
        let mut user_map = m.borrow_mut();
        if let Some(existing) = user_map.get(&me) {
            existing.clone()
        } else {
            let assigned = match requested_role {
                Role::Admin if user_map.values().any(|r| *r == Role::Admin) => Role::Guest,
                Role::Admin => Role::Admin,
                other => other,
            };
            user_map.insert(me, assigned.clone());
            assigned
        }
    })
}

#[update]
fn assign_role(user: Principal, role: Role) {
    require_admin_or_developer();
    USER_ROLES.with(|m| {
        m.borrow_mut().insert(user, role.clone());
    });
    ic_cdk::println!("Admin {:?} assigned role {:?} to {:?}", caller(), role, user);
}

#[query]
fn my_role() -> Role {
    let me = caller();
    USER_ROLES.with(|m| m.borrow().get(&me).cloned().unwrap_or(Role::Guest))
}

#[query]
fn list_users() -> Vec<(Principal, Role)> {
    require_admin_or_developer();
    USER_ROLES.with(|m| {
        m.borrow().iter().map(|(p, r)| (*p, r.clone())).collect()
    })
}

#[query]
fn list_principals() -> Vec<Principal> {
    USER_ROLES.with(|m| m.borrow().keys().cloned().collect())
}

#[query]
fn get_deployer_principal() -> Option<Principal> {
    DEPLOYER_PRINCIPAL.with(|p| p.borrow().clone())
}

#[query]
fn whoami() -> Principal {
    caller()
}

// Admin check based on Role::Admin
fn is_admin(p: Principal) -> bool {
    USER_ROLES.with(|m| matches!(m.borrow().get(&p), Some(Role::Admin)))
}
fn require_admin() {
    let me = caller();
    assert!(me != Principal::anonymous(), "Must be logged in.");
    assert!(is_admin(me), "Only Admin can call this.");
}
fn is_admin_or_developer(p: Principal) -> bool {
    USER_ROLES.with(|m| {
        matches!(m.borrow().get(&p), Some(Role::Admin) | Some(Role::Developer))
    })
}
fn require_admin_or_developer() {
    let me = caller();
    assert!(me != Principal::anonymous(), "Authentication required.");
    assert!(
        is_admin_or_developer(me),
        "Authorization failed: Only Admin or Developer can call this method."
    );
    ic_cdk::println!("Authorized {:?} as Admin/Developer.", me);
}
ic_cdk::export_candid!();
