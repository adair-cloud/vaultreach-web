"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function verify() {
    return __awaiter(this, void 0, void 0, function () {
        var campaigns, recentAnalytics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔍 Checking VaultReach Database for Worker Activity...\n");
                    return [4 /*yield*/, prisma.campaign.findMany({
                            select: {
                                id: true,
                                lastPing: true,
                                user: { select: { email: true } }
                            }
                        })];
                case 1:
                    campaigns = _a.sent();
                    console.log("--- 📡 Campaign Pings ---");
                    if (campaigns.length === 0) {
                        console.log("No campaigns found.");
                    }
                    else {
                        campaigns.forEach(function (c) {
                            var status = "🔴 Never Pinged";
                            if (c.lastPing) {
                                var ageHrs = (Date.now() - new Date(c.lastPing).getTime()) / (1000 * 60 * 60);
                                if (ageHrs < 2)
                                    status = "🟢 ACTIVE (< 2 hrs ago)";
                                else if (ageHrs < 24)
                                    status = "🟡 IDLE (2-24 hrs ago)";
                                else
                                    status = "\uD83D\uDD34 OFFLINE (".concat(ageHrs.toFixed(1), " hrs ago)");
                            }
                            console.log("User: ".concat(c.user.email, " | Status: ").concat(status, " | lastPing: ").concat(c.lastPing));
                        });
                    }
                    console.log("\n--- 📈 Analytics Data ---");
                    return [4 /*yield*/, prisma.analytics.findMany({
                            orderBy: { date: 'desc' },
                            take: 5
                        })];
                case 2:
                    recentAnalytics = _a.sent();
                    if (recentAnalytics.length === 0) {
                        console.log("No analytics rows found yet.");
                    }
                    else {
                        console.table(recentAnalytics.map(function (a) { return ({
                            campaignId: a.campaignId.substring(0, 8) + '...',
                            date: a.date,
                            emailsSent: a.emailsSent,
                            replies: a.replies,
                            meetings: a.meetings
                        }); }));
                    }
                    return [4 /*yield*/, prisma.$disconnect()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
verify().catch(console.error);
