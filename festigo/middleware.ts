import { NextRequest, NextResponse } from "next/server";

import { getDataFromToken } from "./helper/getDataFromToken";

import { Role } from "./Utils/Enums";


interface CustomNextRequest extends NextRequest {
    user: string,
}

const PublicPaths = '/auth/';

const DefaultPage = ["/", "/unauthorized", "/something-went-wrong"];

const commonRoute = ["/","/dashboard"];

const guestRoute = "/guest/";

const adminRoute = "/admin/";

const eventOrganizer = "/eventOrganizer";

const vendorRoute = "/vendor";

export async function middleware(req: CustomNextRequest) {
    
    const path = req.nextUrl.pathname;
    let isLoggedIn = req.cookies.get("token")?.value || "";
    let decodedToken;

    if (isLoggedIn) {

        decodedToken = await getDataFromToken(req);

        // req.user = decodedToken.id;

        console.log("decoded role :", decodedToken);

    }

    if (DefaultPage.includes(path)) {

        return NextResponse.next();

    }

    const isPublicPath = path.startsWith(PublicPaths);

    if (isLoggedIn && isPublicPath) {

        console.log("hellow ");

        return NextResponse.redirect(new URL(`/dashboard`, req.url));
    }

    if (!isLoggedIn && !isPublicPath) {

        return NextResponse.redirect(new URL('/auth/login', req.url));

    }

    if (isLoggedIn) {

        const hasPermission = checkPermission(decodedToken.role, path);

        console.log("is permission ",hasPermission);

        if (!hasPermission) {

            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

    return NextResponse.next();
}

function checkPermission(role: Role, path: string): boolean {

    console.log("role is ",role);

    switch (role) {

        case Role.ADMIN:
            return adminRoute.includes('admin' || "/" || "/dashboard") ;
        case Role.EVENT_ORGANIZER:
            return eventOrganizer.includes('eventOrganizer' || "/" || "/dashboard");
        case Role.GUEST:
            return guestRoute.includes('guest' || "/" || "/dashboard");
        case Role.VENDOR:
            return vendorRoute.includes('vendor' || "/" || "/dashboard");
        default:
            return false;
    }
}

export const config = {

    matcher: ['/((?!api|static|.\\..|_next).*)', '/auth/verifyEmail/:token'],

};





