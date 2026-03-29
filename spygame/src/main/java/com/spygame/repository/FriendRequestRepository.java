package com.spygame.repository;

import com.spygame.model.FriendRequest;
import com.spygame.model.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, FriendRequestStatus status);

    @Query("""
            select fr from FriendRequest fr
            where fr.status = com.spygame.model.FriendRequestStatus.ACCEPTED
            and (fr.sender.id = :userId or fr.receiver.id = :userId)
            order by fr.createdAt desc
            """)
    List<FriendRequest> findAcceptedForUser(@Param("userId") Long userId);

    @Query("""
            select fr from FriendRequest fr
            where ((fr.sender.id = :userId and lower(fr.receiver.username) = lower(:username))
               or (fr.receiver.id = :userId and lower(fr.sender.username) = lower(:username)))
            and fr.status in (com.spygame.model.FriendRequestStatus.PENDING, com.spygame.model.FriendRequestStatus.ACCEPTED)
            """)
    Optional<FriendRequest> findExistingRelationship(@Param("userId") Long userId, @Param("username") String username);
}
