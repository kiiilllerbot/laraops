<?php

use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/admin/users', function () {
    $users = User::select('id', 'name', 'email', 'created_at')
        ->latest()
        ->paginate(25)
        ->withQueryString();

    return Inertia::render('Admin/Users', [
        'users' => $users,
    ]);
})->middleware(['auth', 'verified'])->name('admin.users');

Route::get('/dashboard', function () {
    $users = User::select('id', 'name', 'email', 'created_at')
        ->latest()
        ->paginate(25)
        ->withQueryString();

    return Inertia::render('Dashboard', [
        'users' => $users,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
