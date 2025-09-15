<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_user_sees_users_in_dashboard_table(): void
    {
        $users = User::factory()->count(3)->create();
        $authUser = $users->first();

        $this->actingAs($authUser);

        $response = $this->get('/dashboard');

        $response->assertStatus(200);

        $emails = $users->pluck('email')->all();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('users.data')
            ->where('users.data', function ($data) use ($emails) {
                $emailsInProps = collect($data)->pluck('email')->all();
                return empty(array_diff($emails, $emailsInProps));
            })
        );
    }
}


